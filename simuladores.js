/* Simulador 3 — Primer módulo didáctico B2-012. No hay conexión a sistemas de control reales. */
(() => {
  'use strict';
  // Las fichas y consultas del simulador anterior se mantienen intactas.
  const goToSim = () => {
    if (typeof equipoAbierto !== 'undefined' && equipoAbierto) cerrarFicha();
    const nav = document.querySelector('[data-page="simuladores"]');
    if (nav) nav.click();
    document.getElementById('sim3-eq-separator')?.scrollIntoView({behavior:'smooth',block:'start'});
  };
  document.addEventListener('click', e => {
    if (e.target.closest('[data-sim3-launch]')) goToSim();
  });
  document.getElementById('sim3-open-separator')?.addEventListener('click',goToSim);
  let animating = true;
  const setFlow = () => {
    document.querySelectorAll('.plant-svg').forEach(svg => svg.classList.toggle('sim3-flowing', animating));
    const btn = document.getElementById('sim3-animate');
    if (btn) btn.textContent = animating ? 'Pausar flujo' : 'Animar flujo';
  };
  setFlow();
  document.getElementById('sim3-animate')?.addEventListener('click',() => {animating=!animating;setFlow();});
  const form = document.getElementById('sim3-separator-form');
  const results = document.getElementById('sim3-results-text');
  const liquidLevel = document.getElementById('sim3-liquid-level');
  const get = id => Number(document.getElementById(id).value);
  const fields=['sim3-qgas','sim3-qcond','sim3-qwater','sim3-eta','sim3-holdup'];
  const fmt = n => new Intl.NumberFormat('es-CO',{maximumFractionDigits:3}).format(n);
  const box=(name,value,unit) => `<div class="sim3-result"><small>${name}</small><strong>${fmt(value)} ${unit}</strong></div>`;
  const reset=()=>{results.className='sim3-empty';results.textContent='Introduce los datos y pulsa «Calcular separación». Los campos están vacíos porque el proyecto no documenta todos los caudales reales.';liquidLevel.setAttribute('y','131');liquidLevel.setAttribute('height','16');};
  form?.addEventListener('reset',()=>setTimeout(reset,0));
  document.getElementById('sim3-demo')?.addEventListener('click',()=>{
    const values={'sim3-qgas':5000,'sim3-qcond':6,'sim3-qwater':2,'sim3-eta':92,'sim3-holdup':25};
    Object.entries(values).forEach(([id,val])=>document.getElementById(id).value=val);
    results.className='sim3-warning';
    results.textContent='Valores de ejemplo cargados. Son ficticios y solo sirven para aprender a manejar el modelo. Pulsa «Calcular separación» para ver el balance.';
  });
  form?.addEventListener('submit',e=>{
    e.preventDefault();
    if(fields.some(id=>document.getElementById(id).value.trim()==='')){results.textContent='Introduce todos los datos antes de calcular.';return;}
    const gas=get('sim3-qgas'), cond=get('sim3-qcond'), water=get('sim3-qwater'), efficiency=get('sim3-eta'),hold=get('sim3-holdup');
    if (![gas,cond,water,efficiency,hold].every(Number.isFinite)||gas<0||cond<0||water<0||efficiency<0||efficiency>100||hold<1||hold>80){results.textContent='Revisa los valores: caudales no negativos, eficiencia entre 0 y 100 % y holdup entre 1 y 80 %.';return;}
    const eta=efficiency/100;
    const collectedCond=cond*eta,collectedWater=water*eta;
    const entrainedCond=cond-collectedCond,entrainedWater=water-collectedWater;
    const liquidIn=cond+water, liquidCaptured=collectedCond+collectedWater, liquidOut=entrainedCond+entrainedWater;
    // Estimación geométrica cilíndrica, sin cabezales: D=1.8 m, L=6 m, de la ficha B2-012.
    const geometricVolume=Math.PI*(1.8**2)/4*6;
    const inventoryVolume=geometricVolume*hold/100;
    const residence=liquidCaptured>0?60*inventoryVolume/liquidCaptured:null; // min, fluido drenado en condiciones declaradas.
    const balance=Math.abs(liquidIn-liquidCaptured-liquidOut);
    const html=`<div class="sim3-results-grid">`
        +box('Gas transportado (sin expansión ni pérdida)',gas,'m³/h')
        +box('Condensado capturado',collectedCond,'m³/h')
        +box('Agua capturada',collectedWater,'m³/h')
        +box('Líquidos arrastrados con el gas',liquidOut,'m³/h')
        +box('Volumen cilíndrico aproximado',geometricVolume,'m³')
        +box('Retención líquida supuesta',inventoryVolume,'m³')
        +`</div><p class="sim3-remark"><b>Balance líquido:</b> Entrada ${fmt(liquidIn)} = capturado ${fmt(liquidCaptured)} + arrastrado ${fmt(liquidOut)} m³/h. Diferencia numérica: ${fmt(balance)} m³/h.</p>`
        +(residence!==null?`<p class="sim3-remark"><b>Tiempo de retención indicativo:</b> ${fmt(residence)} min, calculado con el volumen asignado a líquidos y el caudal líquido capturado. No representa tiempo de residencia real de un separador sin conocer la geometría e internos.</p>`:'<p class="sim3-remark">Tiempo de retención no calculable con caudal líquido capturado igual a cero.</p>')
        +`<div class="sim3-warning"><b>Alcance:</b> la eficiencia ${fmt(efficiency)} % es entrada del usuario, no un resultado predicho. No se calcula separación trifásica por equilibrio, arrastre de gotas, presión de operación, presión de diseño, esfuerzo de pared ni cumplimiento de ASME VIII. La fase gaseosa se expresa al mismo estado de entrada.</div>`;
    results.className='';results.innerHTML=html;
    const liquidHeight=92*hold/100;
    liquidLevel.setAttribute('y',String(148-liquidHeight));liquidLevel.setAttribute('height',String(liquidHeight));
  });
})();
