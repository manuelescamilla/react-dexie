import Dexie from 'dexie';

const db = new Dexie("ProvidenceDatabase");
db.version(1).stores({ dataset: "++plat_lot_unit,levy_code_desc,location_zip" });

export default db;
