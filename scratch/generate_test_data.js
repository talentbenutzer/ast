const SERIALS_KEY = "ast_serial_numbers";

const MOEBEL = ["W", "L", "O", "H"];
const FARBEN = ["E", "D", "S", "O", "P"];
const GESTELLE = ["B", "I"];
const KUNDEN = ["P", "G"];
const ARTEDITION = ["XX", "01", "02"];

function generateTestSerials() {
  const serials = [];
  const year = "26";
  
  for (let i = 1; i <= 10; i++) {
    const prodNum = i.toString().padStart(4, "0");
    const furniture = MOEBEL[Math.floor(Math.random() * MOEBEL.length)];
    const color = FARBEN[Math.floor(Math.random() * FARBEN.length)];
    const frame = GESTELLE[Math.floor(Math.random() * GESTELLE.length)];
    const customer = KUNDEN[Math.floor(Math.random() * KUNDEN.length)];
    const art = ARTEDITION[Math.floor(Math.random() * ARTEDITION.length)];
    
    const fullSerial = `${year}/${prodNum}/${furniture}/${color}/${frame}/${customer}/${art}`;
    
    serials.push({
      id: Math.random().toString(36).substr(2, 9),
      year,
      productionNumber: prodNum,
      furnitureCode: furniture,
      colorCode: color,
      frameCode: frame,
      customerType: customer,
      artedition: art,
      buyerName: `Test Kunde ${i}`,
      createdBy: "System",
      status: "Open",
      createdAt: new Date().toISOString(),
      fullSerial
    });
  }
  
  localStorage.setItem(SERIALS_KEY, JSON.stringify(serials));
  console.log("10 Test-Seriennummern generiert.");
}

generateTestSerials();
