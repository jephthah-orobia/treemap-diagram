const randomColor = () => 'rgb(' + Math.round(Math.random() * 255) + ','
    + Math.round(Math.random() * 255) + ','
    + Math.round(Math.random() * 255) + ')';

const KickStarter = {
    url: 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json',
    title: 'Kickstarter Pledges',
    description: 'Top 100 Most Pledged Kickstarter Campaigns Grouped By Category'
},
    MovieSales = {
        url: 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json',
        title: 'Movie Sales',
        description: 'Top 100 Highest Grossing Movies Grouped By Genre'
    },
    ViewGameSales = {
        url: 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json',
        title: 'Video Game Sales',
        description: 'Top 100 Most Sold Video Games Grouped by Platform'
    };

const drawTreeMap = ({ url, title, description }) => {
    console.log('drawTreeMap running');

    fetch(url)
        .then(res => res.json())
        .then(data => {
            console.log(data);

            const svgW = Math.round(window.innerWidth - 16), svgH = Math.round(window.innerHeight - 180),
                pad = { top: 10, left: 10, bottom: 10, right: 10 },
                root = d3.hierarchy(data)
                    .sum(d => d.value)
                    .sort(function (a, b) { return b.height - a.height || b.value - a.value; }),
                cont = d3.select("div#main"),
                categories = data.children.map(d => {
                    const bgcolor = randomColor();
                    const fgcolor = (new Color(bgcolor)).contrast(new Color('white'), "WCAG21") > 3.0 ? '#FFFFFF' : '#000000';
                    return ({ name: d.name.replace(" ", '-'), bg: bgcolor, fg: fgcolor });
                });
            const isLandscape = svgW > 1.3 * svgH;

            const tmW = isLandscape ? svgW * 0.75 - pad.top - pad.bottom : svgW - pad.left - pad.right,
                tmH = isLandscape ? svgH - pad.top - pad.bottom : svgW * 0.75 - pad.left - pad.right;

            const legX = isLandscape ? tmW + pad.left + pad.right : pad.left,
                legY = isLandscape ? pad.top : tmH + pad.top + pad.bottom;


            d3.treemap()
                .size([tmW, tmH])
                .padding(0)
                (root);

            cont.attr('style', categories.map(d => '--' + d.name + '-fg: ' + d.fg + '; --' + d.name + '-bg: ' + d.bg).join('; '));

            cont.append('h1')
                .attr('id', 'title')
                .text(title);

            cont.append('h4')
                .attr('id', 'description')
                .text(description);

            const svg = cont.append('svg')
                .attr('width', svgW)
                .attr('height', svgH);

            svg.selectAll('rect')
                .data(root.leaves())
                .enter()
                .append('rect')
                .attr('class', 'tile')
                .attr('x', d => d.x0 + pad.left)
                .attr('y', d => d.y0 + pad.top)
                .attr('width', d => d.x1 - d.x0)
                .attr('height', d => d.y1 - d.y0)
                .attr('rx', 3)
                .attr('data-name', d => d.data.name)
                .attr('data-category', d => d.data.category)
                .attr('data-value', d => d.data.value)
                .attr('fill', d => 'var(--' + d.data.category.replace(" ", '-') + '-bg)')
                .attr('stroke', 'white')
                .attr('stroke-width', '3px')
                .on('mouseover', function (e) {
                    const d = d3.select(this);
                    d3.select("div#tooltip")
                        .style("visibility", "visible")
                        .style("left", (e.clientX - (window.innerWidth - svgW) / 2 + 32) + "px")
                        .style("top", (e.clientY - 16) + "px")
                        .attr("data-value", d.attr("data-value"));
                    d3.select("#tt-name").text(d.attr("data-name"));
                    d3.select("#tt-category").text(d.attr("data-category"));
                    d3.select("#tt-value").text(d.attr("data-value"));
                })
                .on('mouseout', function (e) {
                    d3.select("div#tooltip").style("visibility", "hidden");
                });

            svg.selectAll('text')
                .data(root.leaves())
                .enter()
                .append("text")
                .attr("x", d => d.x0 + pad.left + 5)    // +10 to adjust position (more right)
                .attr("y", d => d.y0 + pad.top + 12)    // +20 to adjust position (lower)
                .text(d => d.x1 - d.x0 - 10 < d.data.name.length * 5 ? d.data.name.substring(0, Math.round((d.x1 - d.x0 - 30) / 5)) + '...' : d.data.name)
                .attr("font-size", 12)
                .attr("fill", d => 'var(--' + d.data.category.replace(" ", '-') + '-fg)')
                .attr("font-weight", "bolder")
                .attr("lengthAdjust", "spacing")
                .style('text-overflow', "ellipsis");

            const legW = isLandscape ? svgW - pad.left - pad.right - tmW : svgW - pad.left - pad.right,
                legH = isLandscape ? svgH - pad.top - pad.bottom : svgH - pad.top - pad.bottom - tmH,
                legCount = root.children.length;

            const legIW = legH / legCount > 21
                ? legW : (legW) / Math.ceil(legCount / Math.ceil(legH / 21)),
                legIH = legH / legCount > 21 ? legH / legCount : 21;


            console.log(root.children);
            console.log(legCount);
            console.log(legH);
            console.log(legH / 21);
            console.log(Math.ceil(legCount / (legH / 21)));


            const getX = (d, i) => legIH > 21
                ? legX
                : legX + Math.floor(i / (legH / 21)) * legIW;

            const getY = (d, i) => legIH > 21
                ? legY + legIH * i
                : legY + legIH * (i % Math.round(legH / legIH))

            svg.append("g")
                .attr('id', 'legend')
                .selectAll("text")
                .data(root.children)
                .enter()
                .append("text")
                .attr("x", (d, i) => getX(d, i) + 20)
                .attr("y", (d, i) => getY(d, i) + 13)
                .text(d => (d.data.name.length * 5 > legIW)
                    ? d.data.name.substring(0, (legIW - 40) / 5) + ' '
                    : d.data.name + ' ')
                .attr('fill', 'black')

            svg.select("g#legend")
                .selectAll("rect")
                .data(root.children)
                .enter()
                .append("rect")
                .attr("class", "legend-item")
                .style("width", 16)
                .style("height", 16)
                .attr("x", getX)
                .attr("y", getY)
                .attr("fill", d => 'var(--' + d.data.name.replace(" ", '-') + '-bg)');

            //svg.select("g#legend")
            //  .attr('transform', 'translate(' + legX + ',' + legY + ')')

            document.querySelector("#please-wait").remove();
        });

    console.log('drawTreepMap ended');
};

document.onreadystatechange = (e) => {
    console.log('readyState', document.readyState);
    if (document.readyState === "complete") {
        const data = (new URLSearchParams(window.location.search)).get('data');
        switch (data) {
            case 'movies':
                return drawTreeMap(MovieSales);
            case 'kickstarter':
                return drawTreeMap(KickStarter);
            default:
                return drawTreeMap(ViewGameSales);
        }
        drawTreeMap();
    }
}