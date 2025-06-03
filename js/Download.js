function downloadSVGAsPNG(svgId, filename) {
    const svg = document.getElementById(svgId);
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
  
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
  
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
  
    const img = new Image();
  
    const width = svg.viewBox.baseVal.width || svg.clientWidth || 800;
    const height = svg.viewBox.baseVal.height || svg.clientHeight || 500;
  
    canvas.width = width;
    canvas.height = height;
  
    img.onload = function () {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
  
      const imgURI = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
  
      const link = document.createElement("a");
      link.download = filename;
      link.href = imgURI;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  
    img.onerror = function (err) {
      console.error("Image load error:", err);
    };
  
    img.src = url;
  }
  
  document.getElementById("downloadChoropleth")?.addEventListener("click", () => {
    downloadSVGAsPNG("choropleth", "choropleth_map.png");
  });
  
  document.getElementById("downloadLineChart")?.addEventListener("click", () => {
    downloadSVGAsPNG("line", "line_chart.png");
  });
  
  document.getElementById("downloadBarChart")?.addEventListener("click", () => {
    downloadSVGAsPNG("BarChart", "bar_chart.png");
  });
  