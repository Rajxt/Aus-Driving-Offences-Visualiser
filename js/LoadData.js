// LoadData.js
export async function loadData() {
    const geoData = await d3.json("data/aus.geojson");
    const csvData = await d3.csv("data/geographic.csv");
    return [geoData, csvData];
}
