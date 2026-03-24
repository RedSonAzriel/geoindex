import { useState, useMemo, useEffect, useRef } from "react";

const BASINS = [
  { id:"lamu", name:"Lamu Basin", country:"Kenya", type:"Passive Margin", status:"Exploration", area_km2:86000, depth_m:[2000,6000], formations:["Jurassic carbonates","Cretaceous clastics","Paleogene deepwater"], plays:["Deepwater turbidite","Carbonate platform"], estimated_oil_mmbo:{p90:200,p50:680,p10:1800}, estimated_gas_tcf:{p90:5,p50:12.4,p10:28}, wells_drilled:14, discovery_year:null, lat:-1.8, lng:41.2, source:"USGS 2012; Kenya Geological Survey", notes:"Offshore deepwater frontier. Multiple leads via 2D/3D seismic." },
  { id:"anza", name:"Anza Graben", country:"Kenya", type:"Rift", status:"Exploration", area_km2:100000, depth_m:[1500,5000], formations:["Cretaceous sandstones","Jurassic lacustrine"], plays:["Rift flank structural","Lacustrine source"], estimated_oil_mmbo:{p90:50,p50:220,p10:600}, estimated_gas_tcf:{p90:0.5,p50:2.1,p10:6}, wells_drilled:30, discovery_year:null, lat:1.5, lng:39.0, source:"USGS; NOCK Annual Reports", notes:"Onshore rift basin. Shows but no commercial discovery." },
  { id:"lokichar", name:"Lokichar Basin", country:"Kenya", type:"Rift", status:"Appraisal", area_km2:8500, depth_m:[800,3500], formations:["Paleogene-Neogene lacustrine","Lokone Sandstone"], plays:["Lacustrine rift","Stacked sandstone"], estimated_oil_mmbo:{p90:300,p50:560,p10:900}, estimated_gas_tcf:{p90:0.1,p50:0.3,p10:0.8}, wells_drilled:18, discovery_year:2012, lat:2.6, lng:35.8, source:"Tullow Oil; Africa Oil Corp; USGS", notes:"~560 MMBO recoverable. Ngamia, Amosing, Twiga fields." },
  { id:"mandera", name:"Mandera-Lugh Basin", country:"Kenya", type:"Intracratonic", status:"Frontier", area_km2:120000, depth_m:[1000,4000], formations:["Permian-Triassic clastics","Jurassic carbonates"], plays:["Structural/stratigraphic"], estimated_oil_mmbo:{p90:20,p50:90,p10:350}, estimated_gas_tcf:{p90:0.2,p50:1.0,p10:3.5}, wells_drilled:3, discovery_year:null, lat:3.2, lng:41.5, source:"USGS 2012; Kenya open data", notes:"Highly underexplored. Extends into Somalia and Ethiopia." },
  { id:"rovuma_on", name:"Rovuma Basin (Onshore)", country:"Mozambique", type:"Passive Margin", status:"Exploration", area_km2:32000, depth_m:[500,4500], formations:["Cretaceous sandstones","Eocene carbonates"], plays:["Structural","Stratigraphic"], estimated_oil_mmbo:{p90:30,p50:150,p10:500}, estimated_gas_tcf:{p90:2,p50:8,p10:20}, wells_drilled:8, discovery_year:null, lat:-12.5, lng:39.0, source:"INP Mozambique; USGS", notes:"Onshore extension of the prolific Rovuma offshore play." },
  { id:"rovuma_off", name:"Rovuma Basin (Offshore)", country:"Mozambique", type:"Passive Margin", status:"Development", area_km2:150000, depth_m:[2500,7000], formations:["Paleocene-Eocene turbidites","Oligocene channel sands"], plays:["Deepwater turbidite","Channel-levee complex"], estimated_oil_mmbo:{p90:50,p50:200,p10:500}, estimated_gas_tcf:{p90:100,p50:180,p10:250}, wells_drilled:45, discovery_year:2010, lat:-13.5, lng:42.0, source:"ENI; TotalEnergies; ExxonMobil; USGS", notes:"World-class gas: Coral South FLNG producing. ~180 Tcf discovered." },
  { id:"moz_chan", name:"Mozambique Channel Basin", country:"Mozambique", type:"Passive Margin", status:"Frontier", area_km2:200000, depth_m:[3000,8000], formations:["Cretaceous deepwater","Jurassic rift fill"], plays:["Ultra-deepwater turbidite","Pre-salt"], estimated_oil_mmbo:{p90:100,p50:500,p10:2000}, estimated_gas_tcf:{p90:10,p50:40,p10:100}, wells_drilled:5, discovery_year:null, lat:-18.0, lng:38.5, source:"USGS; INP Mozambique", notes:"Ultra-deepwater frontier. Pre-salt analogue to Brazil Santos." },
  { id:"save_lim", name:"Save-Limpopo Basin", country:"Mozambique", type:"Passive Margin", status:"Exploration", area_km2:45000, depth_m:[1000,5000], formations:["Cretaceous deltaic","Tertiary shelf"], plays:["Delta front","Shelf edge"], estimated_oil_mmbo:{p90:40,p50:180,p10:600}, estimated_gas_tcf:{p90:1,p50:4,p10:12}, wells_drilled:12, discovery_year:null, lat:-23.5, lng:35.8, source:"Sasol; INP Mozambique", notes:"Southern Mozambique. Pande/Temane gas fields adjacent." },
  { id:"mandawa", name:"Mandawa Basin", country:"Tanzania", type:"Passive Margin", status:"Exploration", area_km2:28000, depth_m:[1000,5000], formations:["Jurassic-Cretaceous clastics","Eocene carbonates"], plays:["Structural","Stratigraphic pinch-out"], estimated_oil_mmbo:{p90:20,p50:100,p10:400}, estimated_gas_tcf:{p90:0.5,p50:2,p10:8}, wells_drilled:10, discovery_year:null, lat:-9.5, lng:39.2, source:"TPDC; USGS", notes:"Onshore/nearshore. Active exploration 2010-2015." },
  { id:"tz_deep", name:"Tanzania Deepwater", country:"Tanzania", type:"Passive Margin", status:"Appraisal", area_km2:120000, depth_m:[2500,6500], formations:["Cretaceous-Paleogene turbidites","Oligocene channel sands"], plays:["Deepwater turbidite","Stratigraphic"], estimated_oil_mmbo:{p90:20,p50:80,p10:250}, estimated_gas_tcf:{p90:30,p50:57,p10:80}, wells_drilled:22, discovery_year:2010, lat:-9.8, lng:42.5, source:"Equinor; Shell; BG Group; TPDC", notes:"~57 Tcf discovered gas. Tanzania LNG project planned." },
  { id:"selous", name:"Selous Basin", country:"Tanzania", type:"Intracratonic", status:"Frontier", area_km2:65000, depth_m:[500,3000], formations:["Karoo Supergroup","Cretaceous continental"], plays:["Karoo CBM","Conventional structural"], estimated_oil_mmbo:{p90:5,p50:30,p10:120}, estimated_gas_tcf:{p90:0.2,p50:1.5,p10:5}, wells_drilled:4, discovery_year:null, lat:-8.5, lng:36.5, source:"TPDC; USGS", notes:"Largely unexplored. CBM potential from Karoo coals." },
  { id:"ruvu", name:"Ruvu Basin", country:"Tanzania", type:"Rift / Passive Margin", status:"Exploration", area_km2:15000, depth_m:[800,4000], formations:["Jurassic-Cretaceous","Neogene"], plays:["Structural","Combination"], estimated_oil_mmbo:{p90:10,p50:50,p10:200}, estimated_gas_tcf:{p90:0.3,p50:1.2,p10:4}, wells_drilled:6, discovery_year:null, lat:-7.0, lng:38.5, source:"TPDC", notes:"Coastal basin near Dar es Salaam. Songo Songo nearby." },
  // ── ETHIOPIA
  { id:"ogaden", name:"Ogaden Basin", country:"Ethiopia", type:"Intracratonic", status:"Exploration", area_km2:350000, depth_m:[1000,6000], formations:["Permian-Triassic Karoo","Jurassic Hamanlei limestones","Cretaceous Amba Aradom"], plays:["Structural","Stratigraphic","Karoo source"], estimated_oil_mmbo:{p90:100,p50:400,p10:1200}, estimated_gas_tcf:{p90:8,p50:24,p10:60}, wells_drilled:35, discovery_year:1972, lat:6.5, lng:44.5, source:"USGS 2012; Ethiopian Ministry of Mines", notes:"Calub and Hilala gas fields discovered 1972. ~4.7 Tcf proved. Largest sedimentary basin in Ethiopia." },
  { id:"gambela", name:"Gambela Basin", country:"Ethiopia", type:"Rift", status:"Frontier", area_km2:60000, depth_m:[500,4000], formations:["Mesozoic rift fill","Paleogene clastics"], plays:["Rift structural","Source kitchen"], estimated_oil_mmbo:{p90:15,p50:80,p10:300}, estimated_gas_tcf:{p90:0.5,p50:2,p10:8}, wells_drilled:2, discovery_year:null, lat:7.5, lng:34.5, source:"USGS; Ethiopian Geological Survey", notes:"Western Ethiopia frontier. Extension of South Sudan Muglad-Melut rift system." },
  { id:"blue_nile", name:"Blue Nile Basin", country:"Ethiopia", type:"Intracratonic", status:"Frontier", area_km2:80000, depth_m:[800,5000], formations:["Paleozoic-Mesozoic clastics","Jurassic carbonates"], plays:["Structural","Sub-unconformity"], estimated_oil_mmbo:{p90:10,p50:60,p10:250}, estimated_gas_tcf:{p90:0.3,p50:1.5,p10:5}, wells_drilled:1, discovery_year:null, lat:10.5, lng:37.0, source:"USGS; Ethiopian Ministry of Mines", notes:"Largely undrilled. Part of larger East-Central African rift system." },
  { id:"rift_eth", name:"Main Ethiopian Rift", country:"Ethiopia", type:"Rift", status:"Exploration", area_km2:45000, depth_m:[500,3500], formations:["Pliocene-Pleistocene lacustrine","Miocene volcanoclastics"], plays:["Lacustrine rift","Geothermal-adjacent"], estimated_oil_mmbo:{p90:5,p50:30,p10:120}, estimated_gas_tcf:{p90:0.1,p50:0.5,p10:2}, wells_drilled:5, discovery_year:null, lat:7.8, lng:38.8, source:"USGS; Geological Survey of Ethiopia", notes:"Part of the East African Rift. Geothermal resources dominant; hydrocarbon potential secondary." },
  // ── SOMALIA
  { id:"somalia_coast", name:"Somali Coastal Basin", country:"Somalia", type:"Passive Margin", status:"Frontier", area_km2:180000, depth_m:[1500,7000], formations:["Jurassic carbonates","Cretaceous clastics","Paleogene deepwater"], plays:["Deepwater turbidite","Carbonate platform","Rift shoulder"], estimated_oil_mmbo:{p90:200,p50:800,p10:2500}, estimated_gas_tcf:{p90:10,p50:35,p10:80}, wells_drilled:8, discovery_year:null, lat:3.0, lng:47.0, source:"USGS 2012; Soma Oil & Gas; Spectrum Geo", notes:"Offshore frontier with significant seismic coverage. Analogue to Yemen/Oman margin." },
  { id:"mudugh", name:"Mudugh Basin", country:"Somalia", type:"Passive Margin", status:"Frontier", area_km2:90000, depth_m:[1000,5000], formations:["Jurassic Auradu limestones","Cretaceous Jesomma sandstones"], plays:["Carbonate reef","Clastic shelf"], estimated_oil_mmbo:{p90:50,p50:250,p10:800}, estimated_gas_tcf:{p90:2,p50:8,p10:25}, wells_drilled:5, discovery_year:null, lat:5.5, lng:47.5, source:"USGS; FAO Somalia geological reports", notes:"Central Somalia onshore/offshore transition. Limited modern seismic data." },
  { id:"nogal", name:"Nogal Basin", country:"Somalia", type:"Rift", status:"Frontier", area_km2:75000, depth_m:[1000,4500], formations:["Mesozoic rift fill","Jurassic Daghani shales"], plays:["Rift graben","Source-reservoir pair"], estimated_oil_mmbo:{p90:30,p50:150,p10:500}, estimated_gas_tcf:{p90:1,p50:5,p10:15}, wells_drilled:4, discovery_year:null, lat:9.5, lng:48.0, source:"USGS; Range Resources; Genel Energy", notes:"Northern Somalia (Puntland). Shabeel-1 well encountered oil shows." },
  { id:"mandera_som", name:"Mandera-Lugh (Somalia)", country:"Somalia", type:"Intracratonic", status:"Frontier", area_km2:95000, depth_m:[800,4000], formations:["Permian-Triassic clastics","Jurassic carbonates"], plays:["Structural/stratigraphic"], estimated_oil_mmbo:{p90:15,p50:70,p10:280}, estimated_gas_tcf:{p90:0.5,p50:2.5,p10:8}, wells_drilled:2, discovery_year:null, lat:3.8, lng:43.0, source:"USGS 2012", notes:"Somali portion of Mandera-Lugh basin. Extends into Kenya and Ethiopia." },
  // ── ERITREA
  { id:"red_sea_er", name:"Red Sea Basin (Eritrea)", country:"Eritrea", type:"Rift", status:"Frontier", area_km2:55000, depth_m:[1500,5000], formations:["Miocene evaporites","Pre-salt Oligocene clastics","Pliocene-Recent"], plays:["Pre-salt structural","Sub-salt","Rift shoulder"], estimated_oil_mmbo:{p90:30,p50:150,p10:500}, estimated_gas_tcf:{p90:2,p50:8,p10:20}, wells_drilled:6, discovery_year:null, lat:15.5, lng:40.5, source:"USGS; Eritrean Ministry of Energy and Mines", notes:"Conjugate margin to Saudi/Yemeni Red Sea discoveries. Pre-salt plays analogous to Jizan Basin." },
  { id:"danakil", name:"Danakil Basin", country:"Eritrea", type:"Rift", status:"Frontier", area_km2:25000, depth_m:[500,3500], formations:["Miocene-Pliocene evaporites","Afar volcanoclastics"], plays:["Sub-salt","Rift graben"], estimated_oil_mmbo:{p90:5,p50:30,p10:120}, estimated_gas_tcf:{p90:0.2,p50:1,p10:4}, wells_drilled:2, discovery_year:null, lat:14.0, lng:40.3, source:"Eritrean Geological Survey; USGS", notes:"Active tectonic zone. Potash mining active. Hydrocarbon potential largely untested." },
  // ── RWANDA
  { id:"kivu", name:"Lake Kivu Basin", country:"Rwanda", type:"Rift", status:"Exploration", area_km2:2400, depth_m:[200,1500], formations:["Pliocene-Pleistocene lacustrine","Rift volcanoclastics"], plays:["Lacustrine source/reservoir","Dissolved gas"], estimated_oil_mmbo:{p90:1,p50:5,p10:20}, estimated_gas_tcf:{p90:1.5,p50:2.2,p10:3}, wells_drilled:3, discovery_year:1960, lat:-2.0, lng:29.1, source:"Rwanda Energy Group; KivuWatt; USGS", notes:"~55 BCM dissolved methane and CO2 in lake waters. KivuWatt extraction plant operational. Unique dissolved gas play." },
  { id:"rw_rift", name:"Albertine Rift (Rwanda)", country:"Rwanda", type:"Rift", status:"Frontier", area_km2:8000, depth_m:[500,3000], formations:["Miocene-Pliocene lacustrine","Neogene clastics"], plays:["Lacustrine rift","Structural"], estimated_oil_mmbo:{p90:5,p50:25,p10:80}, estimated_gas_tcf:{p90:0.1,p50:0.4,p10:1.5}, wells_drilled:0, discovery_year:null, lat:-1.8, lng:29.5, source:"Rwanda Mining Board; USGS", notes:"Southern extension of Uganda's prolific Albertine Graben. Undrilled but analogous to Ugandan discoveries." },
];

const COUNTRIES = ["All","Eritrea","Ethiopia","Kenya","Mozambique","Rwanda","Somalia","Tanzania"];
const STATUSES = ["All","Frontier","Exploration","Appraisal","Development"];
const STATUS_CLR = { Frontier:"#a78bfa", Exploration:"#fbbf24", Appraisal:"#60a5fa", Development:"#34d399" };
const FLAG = { Kenya:"\u{1F1F0}\u{1F1EA}", Mozambique:"\u{1F1F2}\u{1F1FF}", Tanzania:"\u{1F1F9}\u{1F1FF}", Ethiopia:"\u{1F1EA}\u{1F1F9}", Somalia:"\u{1F1F8}\u{1F1F4}", Eritrea:"\u{1F1EA}\u{1F1F7}", Rwanda:"\u{1F1F7}\u{1F1FC}" };

const Ico = ({children,sz=18,c="currentColor"}) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{children}</svg>;

// ── NAV ITEMS
const NAV_ITEMS = [
  {id:"dash",label:"Dashboard",icon:<Ico sz={17} c="inherit"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 22V12h6v10"/></Ico>},
  {id:"map",label:"Basin Map",icon:<Ico sz={17} c="inherit"><path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z"/><path d="M8 2v16"/><path d="M16 6v16"/></Ico>},
  {id:"lib",label:"Data Library",icon:<Ico sz={17} c="inherit"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></Ico>},
  {id:"fore",label:"Forecasts",icon:<Ico sz={17} c="inherit"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></Ico>,soon:true},
];

// ── SIDEBAR
function Sidebar({active,onNav}) {
  return (
    <nav style={S.sidebar}>
      <div style={S.brand}>
        <div style={S.brandIcon}>
          <Ico sz={18} c="#34d399"><polygon points="12 2 2 7 12 12 22 7"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></Ico>
        </div>
        <div><div style={S.brandName}>GeoIndex</div><div style={S.brandTag}>East & Horn of Africa · v0.3</div></div>
      </div>
      <div style={S.navGroup}>MAIN MENU</div>
      {NAV_ITEMS.map(n=>(
        <button key={n.id} onClick={()=>onNav(n.id)} style={{...S.navItem,...(active===n.id?S.navItemActive:{})}}>
          <span style={{color:active===n.id?"#34d399":"#475569",display:"flex"}}>{n.icon}</span>
          <span>{n.label}</span>
          {n.soon&&<span style={S.soonBadge}>Soon</span>}
        </button>
      ))}
      <div style={{flex:1}}/>
      <div style={S.sideFooter}>
        <div style={S.footLine}>Sources: USGS · NOCK · TPDC</div>
        <div style={S.footLine}>INP · Operator filings · GSE</div>
      </div>
    </nav>
  );
}

// ── KPI ROW
function KPIs({data}) {
  const oil = data.reduce((a,b)=>a+b.estimated_oil_mmbo.p50,0);
  const gas = data.reduce((a,b)=>a+b.estimated_gas_tcf.p50,0);
  const wells = data.reduce((a,b)=>a+b.wells_drilled,0);
  const items = [
    {label:"Basins Indexed",val:data.length,unit:"",color:"#34d399"},
    {label:"Oil P50 Estimate",val:oil.toLocaleString(),unit:"MMBO",color:"#fbbf24"},
    {label:"Gas P50 Estimate",val:gas.toLocaleString(),unit:"Tcf",color:"#60a5fa"},
    {label:"Total Wells",val:wells.toLocaleString(),unit:"drilled",color:"#a78bfa"},
  ];
  return (
    <div style={S.kpiGrid}>
      {items.map((k,i)=>(
        <div key={i} style={S.kpiCard}>
          <div style={S.kpiTop}>
            <span style={S.kpiLabel}>{k.label}</span>
            <div style={{...S.kpiDot,background:k.color,boxShadow:`0 0 8px ${k.color}40`}}/>
          </div>
          <div style={S.kpiBottom}>
            <span style={{...S.kpiVal,color:k.color}}>{k.val}</span>
            {k.unit&&<span style={S.kpiUnit}>{k.unit}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── MAP (Leaflet-based with real terrain tiles)
function MapPanel({data,sel,onSel}) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [leafletReady, setLeafletReady] = useState(false);

  // Load Leaflet CSS + JS
  useEffect(() => {
    if (document.getElementById('leaflet-css')) { setLeafletReady(true); return; }
    const css = document.createElement('link');
    css.id = 'leaflet-css';
    css.rel = 'stylesheet';
    css.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
    document.head.appendChild(css);
    const js = document.createElement('script');
    js.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
    js.onload = () => setLeafletReady(true);
    document.head.appendChild(js);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!leafletReady || !mapContainer.current || mapRef.current) return;
    const L = window.L;
    const map = L.map(mapContainer.current, {
      center: [0, 39],
      zoom: 4,
      zoomControl: false,
      attributionControl: false,
      minZoom: 3,
      maxZoom: 10,
    });

    // Terrain tile layer — OpenTopoMap for that rich cartographic look
    L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      maxZoom: 17,
    }).addTo(map);

    // Zoom control bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Attribution
    L.control.attribution({ position: 'bottomleft', prefix: false })
      .addAttribution('© OpenTopoMap · © OpenStreetMap')
      .addTo(map);

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, [leafletReady]);

  // Update markers when data or selection changes
  useEffect(() => {
    if (!mapRef.current || !window.L) return;
    const L = window.L;
    const map = mapRef.current;

    // Clear old markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    data.forEach(b => {
      const c = STATUS_CLR[b.status];
      const isSel = sel?.id === b.id;
      const radius = Math.max(6, Math.min(18, Math.sqrt(b.area_km2 / 800)));

      const marker = L.circleMarker([b.lat, b.lng], {
        radius: isSel ? radius + 4 : radius,
        fillColor: c,
        color: isSel ? '#fff' : c,
        weight: isSel ? 3 : 1.5,
        opacity: 1,
        fillOpacity: isSel ? 0.85 : 0.6,
      }).addTo(map);

      // Tooltip
      marker.bindTooltip(
        `<div style="font-family:Inter,sans-serif;font-size:12px;line-height:1.5;">
          <strong style="color:#1e293b;">${b.name}</strong><br/>
          <span style="color:#475569;">${b.country} · ${b.status}</span><br/>
          <span style="color:#92400e;font-weight:600;">Oil P50: ${b.estimated_oil_mmbo.p50.toLocaleString()} MMBO</span><br/>
          <span style="color:#1e40af;font-weight:600;">Gas P50: ${b.estimated_gas_tcf.p50.toLocaleString()} Tcf</span>
        </div>`,
        { direction: 'top', offset: [0, -radius], className: 'geo-tooltip' }
      );

      marker.on('click', () => onSel(b));

      // Pulsing ring for selected
      if (isSel) {
        const pulse = L.circleMarker([b.lat, b.lng], {
          radius: radius + 10,
          fillColor: 'transparent',
          color: c,
          weight: 1.5,
          opacity: 0.4,
          dashArray: '4,4',
        }).addTo(map);
        markersRef.current.push(pulse);
      }

      markersRef.current.push(marker);
    });
  }, [data, sel, onSel]);

  // Fly to selected basin
  useEffect(() => {
    if (!mapRef.current || !sel) return;
    mapRef.current.flyTo([sel.lat, sel.lng], 6, { duration: 0.8 });
  }, [sel]);

  return (
    <div style={S.card}>
      <div style={S.cardHead}><span style={S.cardLabel}>Basin Map</span><span style={S.cardBadge}>{data.length} results</span></div>
      <style>{`
        .geo-tooltip {
          background: rgba(15,23,42,0.92) !important;
          border: 1px solid rgba(51,65,85,0.6) !important;
          border-radius: 8px !important;
          padding: 8px 12px !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.4) !important;
          color: #e2e8f0 !important;
        }
        .geo-tooltip .leaflet-tooltip-tip {
          border-top-color: rgba(15,23,42,0.92) !important;
        }
        .leaflet-control-zoom a {
          background: rgba(15,23,42,0.85) !important;
          color: #94a3b8 !important;
          border-color: #1e293b !important;
        }
        .leaflet-control-zoom a:hover {
          background: #1e293b !important;
          color: #e2e8f0 !important;
        }
        .leaflet-control-attribution {
          background: rgba(15,23,42,0.7) !important;
          color: #475569 !important;
          font-size: 9px !important;
        }
        .leaflet-control-attribution a { color: #64748b !important; }
      `}</style>
      <div ref={mapContainer} style={{width:'100%', height:520, borderRadius:'0 0 12px 12px', background:'#0b1120'}} />
      <div style={S.legendRow}>
        {Object.entries(STATUS_CLR).map(([s,c])=>(
          <div key={s} style={{display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:c,boxShadow:`0 0 6px ${c}50`}}/>
            <span style={{fontSize:10,color:"#94a3b8"}}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── TABLE
function Table({data,sel,onSel}) {
  return (
    <div style={{...S.card,overflow:"hidden",display:"flex",flexDirection:"column",minHeight:0}}>
      <div style={S.cardHead}><span style={S.cardLabel}>Basin Library</span></div>
      <div style={{overflowY:"auto",flex:1}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead>
            <tr>{["Basin","Country","Type","Status","Oil P50","Gas P50","Wells"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {data.map(b=>{
              const is=sel?.id===b.id;
              return(
                <tr key={b.id} onClick={()=>onSel(b)} style={{background:is?"#1a2540":"transparent",cursor:"pointer",borderBottom:"1px solid #1e293b20",transition:"background .12s"}}
                  onMouseEnter={e=>{if(!is)e.currentTarget.style.background="#111c30"}} onMouseLeave={e=>{if(!is)e.currentTarget.style.background="transparent"}}>
                  <td style={S.td}><span style={{fontWeight:600,color:"#e2e8f0"}}>{b.name}</span></td>
                  <td style={S.td}><span style={{marginRight:3}}>{FLAG[b.country]}</span>{b.country}</td>
                  <td style={S.td}>{b.type}</td>
                  <td style={S.td}><span style={{...S.pill,color:STATUS_CLR[b.status],background:`${STATUS_CLR[b.status]}15`,border:`1px solid ${STATUS_CLR[b.status]}28`}}>{b.status}</span></td>
                  <td style={{...S.td,fontVariantNumeric:"tabular-nums"}}><span style={{color:"#fbbf24",fontWeight:600}}>{b.estimated_oil_mmbo.p50.toLocaleString()}</span><span style={{color:"#475569",fontSize:10,marginLeft:3}}>MMBO</span></td>
                  <td style={{...S.td,fontVariantNumeric:"tabular-nums"}}><span style={{color:"#60a5fa",fontWeight:600}}>{b.estimated_gas_tcf.p50.toLocaleString()}</span><span style={{color:"#475569",fontSize:10,marginLeft:3}}>Tcf</span></td>
                  <td style={{...S.td,textAlign:"center"}}>{b.wells_drilled}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── DETAIL DRAWER
function Drawer({basin:b,onClose}) {
  if(!b) return null;
  const c=STATUS_CLR[b.status];
  const Bar=({label,p90,p50,p10,unit,accent})=>{const mx=p10*1.15;return(
    <div style={{marginBottom:18}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
        <span style={{fontSize:11,color:"#64748b"}}>{label}</span>
        <span style={{fontSize:13,fontWeight:700,color:accent}}>{p50.toLocaleString()} {unit}</span>
      </div>
      <div style={{position:"relative",height:6,background:"#1e293b",borderRadius:3,overflow:"hidden"}}>
        <div style={{position:"absolute",left:0,top:0,height:"100%",width:`${(p10/mx)*100}%`,background:`${accent}12`,borderRadius:3}}/>
        <div style={{position:"absolute",left:0,top:0,height:"100%",width:`${(p50/mx)*100}%`,background:`${accent}35`,borderRadius:3}}/>
        <div style={{position:"absolute",left:0,top:0,height:"100%",width:`${(p90/mx)*100}%`,background:accent,borderRadius:3,opacity:.65}}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#334155",marginTop:4}}>
        <span>P90: {p90.toLocaleString()}</span><span>P10: {p10.toLocaleString()}</span>
      </div>
    </div>
  )};
  return(
    <div style={S.drawer}>
      <div style={S.drawerInner}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
          <div>
            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}>
              <span style={{...S.pill,color:c,background:`${c}15`,border:`1px solid ${c}28`}}>{b.status}</span>
              <span style={{fontSize:11,color:"#475569"}}>{FLAG[b.country]} {b.country}</span>
            </div>
            <h2 style={{margin:0,fontSize:22,fontWeight:700,color:"#f1f5f9"}}>{b.name}</h2>
            <div style={{fontSize:12,color:"#475569",marginTop:3}}>{b.type} Basin</div>
          </div>
          <button onClick={onClose} style={S.xBtn}><Ico sz={15} c="#64748b"><path d="M18 6L6 18M6 6l12 12"/></Ico></button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
          {[{l:"Area",v:`${b.area_km2.toLocaleString()} km\u00B2`},{l:"Depth",v:`${b.depth_m[0]}\u2013${b.depth_m[1]}m`},{l:"Wells",v:b.wells_drilled},{l:"Discovery",v:b.discovery_year||"\u2014"}].map(s=>(
            <div key={s.l} style={S.statBox}><div style={{fontSize:10,color:"#475569",textTransform:"uppercase",letterSpacing:".04em"}}>{s.l}</div><div style={{fontSize:16,fontWeight:700,color:"#e2e8f0",marginTop:2}}>{s.v}</div></div>
          ))}
        </div>
        <div style={{...S.section,marginBottom:18}}>
          <div style={S.secTitle}>Resource Estimates (Probabilistic)</div>
          <Bar label="Recoverable Oil" p90={b.estimated_oil_mmbo.p90} p50={b.estimated_oil_mmbo.p50} p10={b.estimated_oil_mmbo.p10} unit="MMBO" accent="#fbbf24"/>
          <Bar label="Recoverable Gas" p90={b.estimated_gas_tcf.p90} p50={b.estimated_gas_tcf.p50} p10={b.estimated_gas_tcf.p10} unit="Tcf" accent="#60a5fa"/>
        </div>
        <div style={{marginBottom:14}}>
          <div style={S.secTitle}>Key Formations</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{b.formations.map(f=><span key={f} style={S.tag}>{f}</span>)}</div>
        </div>
        <div style={{marginBottom:14}}>
          <div style={S.secTitle}>Play Types</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{b.plays.map(p=><span key={p} style={{...S.tag,color:c,background:`${c}10`,border:`1px solid ${c}20`}}>{p}</span>)}</div>
        </div>
        <div style={{marginBottom:14}}>
          <div style={S.secTitle}>Analyst Notes</div>
          <p style={{margin:0,fontSize:13,color:"#94a3b8",lineHeight:1.7}}>{b.notes}</p>
        </div>
        <div style={{fontSize:10,color:"#334155",borderTop:"1px solid #1e293b",paddingTop:12}}>Source: {b.source}</div>
      </div>
    </div>
  );
}

// ── MAIN
export default function App() {
  const [page,setPage]=useState("dash");
  const [q,setQ]=useState("");
  const [ctry,setCtry]=useState("All");
  const [stat,setStat]=useState("All");
  const [sel,setSel]=useState(null);

  const filtered=useMemo(()=>{
    let r=BASINS;
    if(q){const lq=q.toLowerCase();r=r.filter(b=>b.name.toLowerCase().includes(lq)||b.formations.some(f=>f.toLowerCase().includes(lq))||b.plays.some(p=>p.toLowerCase().includes(lq))||b.notes.toLowerCase().includes(lq));}
    if(ctry!=="All")r=r.filter(b=>b.country===ctry);
    if(stat!=="All")r=r.filter(b=>b.status===stat);
    return r;
  },[q,ctry,stat]);

  return(
    <div style={S.root}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#0b1120}::-webkit-scrollbar-thumb{background:#1e293b;border-radius:4px}
        @keyframes slideIn{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}
      `}</style>
      <Sidebar active={page} onNav={setPage}/>
      <main style={S.main}>
        {/* Top bar */}
        <header style={S.header}>
          <div style={S.headerLeft}>
            <h1 style={S.pageTitle}>Dashboard</h1>
            <span style={S.breadcrumb}>Overview · East Africa & Horn of Africa Region</span>
          </div>
          <div style={S.headerRight}>
            <div style={S.searchWrap}>
              <Ico sz={14} c="#475569"><circle cx="11" cy="11" r="6"/><path d="M16 16l4 4"/></Ico>
              <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search basins, formations..." style={S.searchIn}/>
            </div>
            <select value={ctry} onChange={e=>setCtry(e.target.value)} style={S.sel}>{COUNTRIES.map(c=><option key={c} value={c} style={{background:"#0f172a"}}>{c==="All"?"All Countries":c}</option>)}</select>
            <select value={stat} onChange={e=>setStat(e.target.value)} style={S.sel}>{STATUSES.map(s=><option key={s} value={s} style={{background:"#0f172a"}}>{s==="All"?"All Status":s}</option>)}</select>
          </div>
        </header>
        {/* Content */}
        <div style={S.body}>
          <KPIs data={filtered}/>
          <div style={S.grid2}>
            <MapPanel data={filtered} sel={sel} onSel={setSel}/>
            <Table data={filtered} sel={sel} onSel={setSel}/>
          </div>
        </div>
      </main>
      <Drawer basin={sel} onClose={()=>setSel(null)}/>
    </div>
  );
}

// ── STYLES
const S={
  root:{display:"flex",width:"100%",minHeight:"100vh",background:"#080e1a",color:"#cbd5e1",fontFamily:"'Inter',sans-serif",fontSize:13},

  // sidebar
  sidebar:{width:230,minHeight:"100vh",background:"#0c1322",borderRight:"1px solid #1a2338",display:"flex",flexDirection:"column",flexShrink:0},
  brand:{display:"flex",alignItems:"center",gap:10,padding:"22px 20px 18px",borderBottom:"1px solid #1a2338"},
  brandIcon:{width:38,height:38,borderRadius:10,background:"linear-gradient(135deg,#064e3b 0%,#0d9488 100%)",display:"flex",alignItems:"center",justifyContent:"center"},
  brandName:{fontSize:17,fontWeight:800,color:"#f1f5f9",letterSpacing:"-.02em"},
  brandTag:{fontSize:10,color:"#475569",marginTop:1},
  navGroup:{fontSize:10,fontWeight:600,color:"#293548",letterSpacing:".1em",padding:"20px 20px 8px"},
  navItem:{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 20px",border:"none",background:"transparent",cursor:"pointer",fontSize:13,fontFamily:"inherit",fontWeight:500,color:"#64748b",borderLeft:"3px solid transparent",transition:"all .15s"},
  navItemActive:{background:"#111b2e",borderLeftColor:"#34d399",color:"#e2e8f0"},
  soonBadge:{marginLeft:"auto",fontSize:9,fontWeight:600,color:"#475569",background:"#1a2338",padding:"2px 7px",borderRadius:4},
  sideFooter:{padding:"16px 20px",borderTop:"1px solid #1a2338"},
  footLine:{fontSize:10,color:"#293548",lineHeight:1.6},

  // header
  header:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 28px",borderBottom:"1px solid #1a2338",background:"#0c1322",flexWrap:"wrap",gap:12},
  headerLeft:{},
  pageTitle:{fontSize:20,fontWeight:700,color:"#f1f5f9",letterSpacing:"-.01em"},
  breadcrumb:{fontSize:11,color:"#475569",marginTop:2,display:"block"},
  headerRight:{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"},
  searchWrap:{display:"flex",alignItems:"center",gap:7,background:"#111b2e",border:"1px solid #1e2d45",borderRadius:8,padding:"7px 12px",minWidth:240},
  searchIn:{background:"transparent",border:"none",outline:"none",color:"#e2e8f0",fontSize:12,fontFamily:"inherit",width:"100%"},
  sel:{background:"#111b2e",border:"1px solid #1e2d45",color:"#94a3b8",padding:"7px 12px",borderRadius:8,fontSize:12,fontFamily:"inherit",cursor:"pointer",outline:"none",appearance:"none",WebkitAppearance:"none",minWidth:110},

  // main
  main:{flex:1,display:"flex",flexDirection:"column",minWidth:0},
  body:{flex:1,padding:24,overflowY:"auto"},

  // kpis
  kpiGrid:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:22},
  kpiCard:{background:"#0c1322",border:"1px solid #1a2338",borderRadius:12,padding:"18px 20px"},
  kpiTop:{display:"flex",justifyContent:"space-between",alignItems:"center"},
  kpiLabel:{fontSize:12,color:"#475569",fontWeight:500},
  kpiDot:{width:9,height:9,borderRadius:"50%"},
  kpiBottom:{marginTop:8,display:"flex",alignItems:"baseline",gap:6},
  kpiVal:{fontSize:28,fontWeight:800,letterSpacing:"-.02em"},
  kpiUnit:{fontSize:11,color:"#475569",fontWeight:500},

  // cards
  card:{background:"#0c1322",border:"1px solid #1a2338",borderRadius:12,overflow:"hidden"},
  cardHead:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 18px",borderBottom:"1px solid #1a2338"},
  cardLabel:{fontSize:14,fontWeight:600,color:"#e2e8f0"},
  cardBadge:{fontSize:10,fontWeight:600,color:"#34d399",background:"#34d39912",padding:"3px 9px",borderRadius:6,border:"1px solid #34d39920"},

  // legend
  legendRow:{display:"flex",gap:14,padding:"10px 18px",borderTop:"1px solid #1a2338"},

  // grid
  grid2:{display:"grid",gridTemplateColumns:"420px 1fr",gap:18,alignItems:"start"},

  // table
  th:{textAlign:"left",padding:"10px 14px",fontSize:10,fontWeight:600,color:"#3d4f6a",textTransform:"uppercase",letterSpacing:".06em",borderBottom:"1px solid #1a2338",background:"#091019",position:"sticky",top:0,zIndex:2},
  td:{padding:"11px 14px",color:"#94a3b8",whiteSpace:"nowrap"},
  pill:{fontSize:10,fontWeight:600,padding:"3px 9px",borderRadius:6,display:"inline-block"},

  // drawer
  drawer:{position:"fixed",top:0,right:0,bottom:0,width:420,background:"#0c1322",borderLeft:"1px solid #1a2338",zIndex:200,overflowY:"auto",animation:"slideIn .22s ease-out",boxShadow:"-12px 0 40px rgba(0,0,0,.5)"},
  drawerInner:{padding:26},
  xBtn:{background:"#111b2e",border:"1px solid #1e2d45",borderRadius:8,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"},

  // detail
  statBox:{background:"#111b2e",borderRadius:8,padding:"10px 14px",border:"1px solid #1e2d4530"},
  section:{background:"#091019",borderRadius:10,padding:16,border:"1px solid #1a2338"},
  secTitle:{fontSize:11,fontWeight:600,color:"#3d4f6a",textTransform:"uppercase",letterSpacing:".06em",marginBottom:12},
  tag:{fontSize:11,padding:"4px 10px",borderRadius:6,background:"#111b2e",color:"#94a3b8",border:"1px solid #1e2d4530",fontWeight:500},
};
