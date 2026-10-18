/* Two small local ornaments; the full card shells remain in front. */
(()=>{
 'use strict';
 const ornaments={"bird": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"7 9 21 17\" shape-rendering=\"crispEdges\"><path fill=\"currentColor\" d=\"M9 9h4v1H9zM17 9h2v1H17zM10 10h4v1H10zM18 10h2v1H18zM11 11h4v1H11zM19 11h2v1H19zM12 12h4v1H12zM19 12h2v1H19zM13 13h4v1H13zM18 13h3v1H18zM14 14h8v1H14zM15 15h2v1H15zM18 15h1v1H18zM20 15h2v1H20zM24 15h3v1H24zM17 16h3v1H17zM21 16h1v1H21zM23 16h2v1H23zM26 16h2v1H26zM12 17h1v1H12zM14 17h13v1H14zM11 18h1v1H11zM13 18h1v1H13zM15 18h10v1H15zM12 19h1v1H12zM14 19h2v1H14zM17 19h2v1H17zM20 19h4v1H20zM11 20h1v1H11zM13 20h4v1H13zM18 20h6v1H18zM10 21h1v1H10zM12 21h1v1H12zM15 21h8v1H15zM9 22h1v1H9zM11 22h1v1H11zM16 22h1v1H16zM19 22h1v1H19zM8 23h1v1H8zM10 23h1v1H10zM15 23h2v1H15zM18 23h2v1H18zM7 24h1v1H7zM9 24h1v1H9zM8 25h1v1H8z\"/></svg>", "branch": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 30 20\" shape-rendering=\"crispEdges\"><path fill=\"currentColor\" d=\"M10 0h1v1H10zM10 1h1v1H10zM2 2h1v1H2zM5 2h2v1H5zM10 2h3v1H10zM14 2h2v1H14zM3 3h4v1H3zM11 3h1v1H11zM13 3h2v1H13zM16 3h1v1H16zM3 4h1v1H3zM6 4h2v1H6zM11 4h1v1H11zM13 4h4v1H13zM3 5h5v1H3zM10 5h1v1H10zM12 5h1v1H12zM14 5h2v1H14zM4 6h2v1H4zM8 6h2v1H8zM12 6h1v1H12zM20 6h3v1H20zM9 7h2v1H9zM12 7h2v1H12zM21 7h3v1H21zM8 8h1v1H8zM11 8h2v1H11zM14 8h4v1H14zM24 8h1v1H24zM28 8h1v1H28zM12 9h1v1H12zM20 9h1v1H20zM24 9h1v1H24zM27 9h2v1H27zM2 10h2v1H2zM8 10h1v1H8zM4 11h1v1H4zM9 11h3v1H9zM1 12h3v1H1zM5 12h1v1H5zM11 12h1v1H11zM0 13h3v1H0zM6 13h1v1H6zM10 13h1v1H10zM7 14h3v1H7zM6 15h5v1H6zM6 16h1v1H6zM9 16h2v1H9zM6 17h2v1H6zM9 17h2v1H9zM7 18h3v1H7z\"/></svg>"};
 function mount(selector,shape,placement){
  const host=document.querySelector(selector);if(!host)return;
  host.classList.add('visual-accent-host');
  const accent=document.createElement('span');
  accent.className='visual-accent visual-accent--'+placement;
  accent.setAttribute('aria-hidden','true');
  accent.innerHTML=ornaments[shape];
  accent.querySelector('svg').setAttribute('focusable','false');
  // Decorations must not displace the first content child used by legacy CSS.
  host.append(accent);
 }
 mount('#how-it-works .css-1n748jd','branch','conversation');
 mount('#method .module-featuresTimed-media','bird','method');
})();
