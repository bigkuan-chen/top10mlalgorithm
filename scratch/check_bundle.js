async function check() {
  try {
    const res = await fetch('https://top10mlalgorithm.vercel.app/_next/static/chunks/app/layout-fbc1cd75ff8c0638.js');
    const code = await res.text();
    console.log("Code length:", code.length);
    console.log("Contains assistant-config?", code.includes('assistant-config'));
    console.log("Contains AiAssistant?", code.includes('AiAssistant'));
  } catch (e) {
    console.error(e);
  }
}

check();
