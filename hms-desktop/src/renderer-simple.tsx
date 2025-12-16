// Very simple test without any imports
console.log("Simple renderer is loading...");

const container = document.getElementById("root");
console.log("Container found:", container);

if (container) {
  container.innerHTML = `
    <div style="padding: 20px; background-color: #f0f0f0; min-height: 100vh; font-family: Arial, sans-serif;">
      <h1 style="color: #333; font-size: 24px; margin-bottom: 20px;">HMS Desktop - Direct HTML Test</h1>
      <p style="color: #666; font-size: 16px; margin-bottom: 20px;">If you can see this, the basic rendering is working!</p>
      <button onclick="alert('Direct HTML is working!')" style="padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Test Button</button>
    </div>
  `;
  console.log("Direct HTML rendered!");
} else {
  console.error("Root element not found");
}
