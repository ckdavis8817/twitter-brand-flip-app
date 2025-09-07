"use strict";(()=>{var e={};e.id=565,e.ids=[565],e.modules={145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},249:(e,t)=>{Object.defineProperty(t,"l",{enumerable:!0,get:function(){return function e(t,n){return n in t?t[n]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,n)):"function"==typeof t&&"default"===n?t:void 0}}})},740:(e,t,n)=>{n.r(t),n.d(t,{config:()=>d,default:()=>u,routeModule:()=>c});var o={};n.r(o),n.d(o,{default:()=>a});var r=n(802),s=n(153),i=n(249);async function a(e,t){if(console.log("=== API GENERATE CALLED ==="),console.log("API Key exists:",!!process.env.ANTHROPIC_API_KEY),"POST"!==e.method)return t.status(405).json({message:"Method not allowed"});try{let{trend:n}=e.body;if(!n)return t.status(400).json({error:"Trend data is required"});let o=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":process.env.ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01"},body:JSON.stringify({model:"claude-3-haiku-20240307",max_tokens:1e3,messages:[{role:"user",content:`You are a maverick brand strategist. Create a Twitter thread that flips "${n.topic}" into positive brand strategy. Start with "🚨 BREAKING: While everyone's focusing on ${n.topic}, here's the HIDDEN brand strategy lesson worth MILLIONS..." Write 6 tweets in thread format with bold words, emojis, and actionable steps. End with #BrandStrategy #Entrepreneurship #Marketing`}]})}),r=await o.json();if(console.log("Claude API Response Status:",o.status),console.log("Claude API Response:",JSON.stringify(r,null,2)),r.content&&r.content[0])console.log("SUCCESS: Got response from Claude"),t.status(200).json({content:r.content[0].text,trend:n.topic,timestamp:new Date().toISOString()});else throw Error("Invalid response from Claude")}catch(o){console.error("Claude API Error:",o);let n=`🚨 BREAKING: While everyone's focusing on the ${e.body.trend?.topic} drama, here's the HIDDEN brand strategy lesson that's worth MILLIONS...

A THREAD 🧵 (1/6)

1/ The internet is going CRAZY over this situation...

But while critics focus on the chaos, smart entrepreneurs see the REAL opportunity: FREE ATTENTION = BUSINESS GOLD 💰

2/ Here's what most business owners miss:

Every controversy teaches us about:
→ Crisis management
→ Authentic communication  
→ Standing out from competitors

3/ The Brand Flip Strategy:
❌ Traditional: Hide from drama
✅ Maverick Move: LEARN from the situation

Bold voices get heard in noisy markets 📈

4/ Your action plan:
→ Monitor industry hot topics
→ Find the business lesson
→ Share your authentic take
→ Let courage drive content

5/ Remember: Visibility beats perfection

While others play it safe, YOU can dominate by being REAL

6/ What controversial topic in YOUR industry could become brand gold?

Drop your thoughts 👇

#BrandStrategy #Entrepreneurship #Marketing`;t.status(200).json({content:n,trend:e.body.trend?.topic||"Unknown",timestamp:new Date().toISOString(),source:"fallback"})}}let u=(0,i.l)(o,"default"),d=(0,i.l)(o,"config"),c=new r.PagesAPIRouteModule({definition:{kind:s.x.PAGES_API,page:"/api/generate",pathname:"/api/generate",bundlePath:"",filename:""},userland:o})},153:(e,t)=>{var n;Object.defineProperty(t,"x",{enumerable:!0,get:function(){return n}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(n||(n={}))},802:(e,t,n)=>{e.exports=n(145)}};var t=require("../../webpack-api-runtime.js");t.C(e);var n=t(t.s=740);module.exports=n})();