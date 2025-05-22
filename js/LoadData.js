// Loading data for choropleth
export async function loadChoropleth() {

    const geoData = await d3.json("data/aus.geojson");
    const csvData = await d3.csv("data/geographic.csv");
    return [geoData, csvData];
}

// Loading data for Line Chart
export async function loadLine() {

    const natOver = await d3.csv("/data/nationaloverview.csv");
    return [natOver];
}






