(function(){
'use strict';

var aacczcbzxczzzb="/*__ECP_PAYLOAD_BEGIN__f8a0fb6277ba8f85__*/";
var xbzxcxbycycxcb="/*__ECP_PAYLOAD_END__f8a0fb6277ba8f85__*/";
var bccxcxbzaxybcx="q+RiXaccYXgWGtRmO8z5+DfbpVElGk0NP9JLycRIt5k=";
var yzyccybbbzcczc="RO+byhHR+DTqMfYbiyf2jdS07zAIymh9WjGT0FmkNWmJ5K6rSoJfELDY6f5ioN9NaBjDjzYT0ev1RAB9Ruq4L6b85XkSI2tCReUfVEcu3+uJd3n/Izhpm3uJhDJLPU2Q4Taz0cC0jwb8xyWTCsl0HBebrHfTvtIyMcJFlPgtDPfDByBr8s4dNrdyvSc1hZTT/wmKrLkHqH6sVmGf9c1M6FTouhjhP98HHyqBaJFb5cnHfT7sfIKxBQWmrbuH4NNX1XmIRdJKG2PhVG4u2w5l5TwP9vuYYtEQK6N38KKijC1H8tA7+w56gP8CPxWiqr1NkgN3plCGx8KoAEdTxPi6Hw==";
var xczyaazacaxxzy="MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvXr38Z0Y6n/v+bhOgMnXyVn2Ou+FhH24oPMzvVbhxbqNzzc6wn/Rag8rK54sM0cbUY6l3YWJ2A5+UbvbTbINs2p7n5hdbApBeZdxIJrbOTXJEAb22xiYZ1iRT29sAdKVyYemSw8aGWnHqflYdPnuLF9jXojBr79WEiGs6LCwI/L9JhvUKHjxQTOMGo+nIiLc2ksntcKtuthviiEmBgdb5s71r6eUqW9Vzr1x5xcQ5ifAy7bIefNZvRwbJKjn8O1gmf2ebsTSBgcGLLg0hucKg4eOPateu4tRGX+nFdk2PsNvgga5bHrGBGgc5m0gw9XybMaH5U8ybJWK4cO0g45QzQIDAQAB";
var ybzcbcxzcbyzab="{\"alg\":\"RSA-PSS-SHA256\",\"opt\":{\"aggressive\":false,\"integrity\":true,\"seed\":93201},\"payloadHashB64\":\"q+RiXaccYXgWGtRmO8z5+DfbpVElGk0NP9JLycRIt5k=\",\"saltLength\":32,\"type\":\"js\",\"v\":1}";

function abzcyzxbcbcyay(zbxzzcyyyyczyc){
  try{
    var bzxczxxbacbaaz=atob(zbxzzcyyyyczyc);
    var xyyxyczzbxayby=new Uint8Array(bzxczxxbacbaaz.length);
    for(var azbbxbaxzcabbc=0; azbbxbaxzcabbc<bzxczxxbacbaaz.length; azbbxbaxzcabbc++) xyyxyczzbxayby[azbbxbaxzcabbc]=bzxczxxbacbaaz.charCodeAt(azbbxbaxzcabbc);
    return xyyxyczzbxayby;
  }catch(_){ return null; }
}

function cyzzzaycabzccz(cxxayabzyaaccz){
  var bxczzzcbxyccca='';
  for(var bxybzabczyaccx=0; bxybzabczyaccx<cxxayabzyaaccz.length; bxybzabczyaccx++) bxczzzcbxyccca+=String.fromCharCode(cxxayabzyaaccz[bxybzabczyaccx]);
  return btoa(bxczzzcbxyccca);
}

function bbbxabbbcyabcz(){
  try{
    return (document.currentScript && document.currentScript.textContent) ? document.currentScript.textContent : '';
  }catch(_){ return ''; }
}

function xxzbxxybazyxcx(aaxazabbccccxx){
  return String(aaxazabbccccxx).replace(/\r\n/g,'\n');
}

async function xyazzbzzcyzbca(){
  if(!globalThis.crypto || !crypto.subtle || !globalThis.TextEncoder) throw new Error('ECP: WebCrypto missing');

  var zbxzzcyyyyczyc=bbbxabbbcyabcz();
  if(!zbxzzcyyyyczyc) throw new Error('ECP: currentScript unavailable');

  var bzxczxxbacbaaz=zbxzzcyyyyczyc.indexOf(aacczcbzxczzzb);
  var xyyxyczzbxayby=zbxzzcyyyyczyc.indexOf(xbzxcxbycycxcb);
  if(bzxczxxbacbaaz<0 || xyyxyczzbxayby<0 || xyyxyczzbxayby<=bzxczxxbacbaaz) throw new Error('ECP: markers missing');

  var azbbxbaxzcabbc=zbxzzcyyyyczyc.slice(bzxczxxbacbaaz+aacczcbzxczzzb.length, xyyxyczzbxayby);
  azbbxbaxzcabbc=xxzbxxybazyxcx(azbbxbaxzcabbc); // normalize LF

  var cxxayabzyaaccz=new TextEncoder().encode(azbbxbaxzcabbc);
  var bxczzzcbxyccca=await crypto.subtle.digest('SHA-256', cxxayabzyaaccz);
  var bxybzabczyaccx=cyzzzaycabzccz(new Uint8Array(bxczzzcbxyccca));
  if(bxybzabczyaccx!==bccxcxbzaxybcx) throw new Error('ECP: integrity failed');

  var xbbxcbbxacaxyc=abzcyzxbcbcyay(xczyaazacaxxzy);
  var czzcacyaxaazxx=abzcyzxbcbcyay(yzyccybbbzcczc);
  if(!xbbxcbbxacaxyc || !czzcacyaxaazxx) throw new Error('ECP: decode failed');

  var yazxazabbxabxz=await crypto.subtle.importKey(
    'spki',
    xbbxcbbxacaxyc.buffer,
    { name:'RSA-PSS', hash:'SHA-256' },
    false,
    ['verify']
  );

  var bxcybbzbzbyccb=await crypto.subtle.verify(
    { name:'RSA-PSS', saltLength:32 },
    yazxazabbxabxz,
    czzcacyaxaazxx,
    new TextEncoder().encode('ECPv1|' + ybzcbcxzcbyzab)
  );

  if(!bxcybbzbzbyccb) throw new Error('ECP: signature invalid');

  ycczzcyaaybxbazbxc();
}

xyazzbzzcyzbca().catch(function(e){
  try{ console.error('[ECP]', e && e.message ? e.message : e); }catch(_){}
});
})();
/*__ECP_PAYLOAD_BEGIN__f8a0fb6277ba8f85__*/function ycczzcyaaybxbazbxc(){
function a(){const m=['application/json','128836ycLrLs','POST','auth','18966860sEMdse','json','451490fkOZiB','1611cOLeqs','stringify','status','7039010JtGxEY','456650KIbwNa','3EVmCHm','Request\x20failed','24UpzBJb','same-origin','761257ZJidcQ','error','request','28856okGRGm','2JHXhkf'];a=function(){return m;};return a();}(function(c,d){const i=b,e=c();while(!![]){try{const f=-parseInt(i(0x16b))/0x1*(-parseInt(i(0x162))/0x2)+parseInt(i(0x163))/0x3*(parseInt(i(0x158))/0x4)+-parseInt(i(0x15d))/0x5*(-parseInt(i(0x165))/0x6)+-parseInt(i(0x167))/0x7+-parseInt(i(0x16a))/0x8*(-parseInt(i(0x15e))/0x9)+parseInt(i(0x161))/0xa+-parseInt(i(0x15b))/0xb;if(f===d)break;else e['push'](e['shift']());}catch(g){e['push'](e['shift']());}}}(a,0x59802));function b(c,d){c=c-0x158;const e=a();let f=e[c];return f;}const API={async 'request'(c,d,e){const j=b,f={'method':c,'headers':{'Content-Type':j(0x16c)},'credentials':j(0x166)};if(e)f['body']=JSON[j(0x15f)](e);const g=await fetch(d,f),h=await g[j(0x15c)]();if(!g['ok']){g[j(0x160)]===0x191&&App['showView'](j(0x15a));throw new Error(h[j(0x168)]||j(0x164));}return h;},'get'(c){return this['request']('GET',c);},'post'(c,d){const k=b;return this['request'](k(0x159),c,d);},'put'(c,d){const l=b;return this[l(0x169)]('PUT',c,d);},'del'(c){return this['request']('DELETE',c);}};
}
/*__ECP_PAYLOAD_END__f8a0fb6277ba8f85__*/
