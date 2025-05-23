// Loading data for choropleth
export async function loadChoropleth() {

    const geoData = await d3.json("data/aus.geojson");
    const csvData = await d3.csv("data/geo.csv");
    return [geoData, csvData];
}

// Loading data for Line Chart
export async function loadLine() {

    const natOver = await d3.csv("/data/nationaloverview.csv");
    return [natOver];
}

// LoadData.js
export async function loadBar() {
    const data = await d3.csv("/data/AgewithMonth.csv", d => ({
        month: d.START_DATE.slice(0, 7), // "2023-01"
        ageGroup: d.AGE_GROUP,
        fines: +d.FINES,
        arrests: +d.ARRESTS,
        charges: +d.CHARGES
    }));
    return data;
}






