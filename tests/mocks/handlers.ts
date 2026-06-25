import { http, HttpResponse } from "msw";

const MOCK_SHEETS_BASE = "https://sheets.googleapis.com/v4/spreadsheets";

export const handlers = [
  http.get(`${MOCK_SHEETS_BASE}/:spreadsheetId/values/:range`, ({ params }) => {
    const range = params.range as string;
    if (range.startsWith("Products")) {
      return HttpResponse.json({ range: "Products!A1:Z100", majorDimension: "ROWS", values: [
        ["id","title","slug","categoryId","description","fabric","occasion","basePrice","discountPct","finalPrice","tags","isNewArrival","isTrending","isActive","createdAt","updatedAt"],
        ["prod_001","Banarasi Silk Saree","banarasi-silk-saree","cat_001","Elegant handwoven Banarasi silk saree","Silk","Wedding,Festive","12999","10","11699","silk,banarasi,wedding","true","true","true","2024-01-15T10:00:00Z","2024-01-15T10:00:00Z"],
        ["prod_002","Anarkali Suit Set","anarkali-suit-set","cat_004","Floor-length Anarkali with dupatta","Georgette","Party,Festive","5999","15","5099","anarkali,party,blue","true","false","true","2024-01-16T10:00:00Z","2024-01-16T10:00:00Z"],
      ]});
    }
    if (range.startsWith("Categories")) {
      return HttpResponse.json({ range: "Categories!A1:Z100", majorDimension: "ROWS", values: [
        ["id","name","slug","parentId","displayOrder","iconUrl","isActive"],
        ["cat_001","Sarees","sarees","","1","/icons/saree.svg","true"],
        ["cat_002","Lehengas","lehengas","","2","/icons/lehenga.svg","true"],
        ["cat_003","Kids Wear","kids-wear","","3","/icons/kids.svg","true"],
        ["cat_004","Salwar Suits","salwar-suits","","4","/icons/salwar.svg","true"],
        ["cat_005","Kurtis","kurtis","","5","/icons/kurti.svg","true"],
        ["cat_006","Dupattas","dupattas","","6","/icons/dupatta.svg","true"],
      ]});
    }
    if (range.startsWith("Users")) {
      return HttpResponse.json({ range: "Users!A1:Z100", majorDimension: "ROWS", values: [
        ["id","role","email","phone","passwordHash","name","createdAt","lastLoginAt","isActive"],
        ["usr_001","owner","admin@adityatextile.com","+919876543210","$2b$12$LJ3m4ys2Zve0bh0g5friYO","Aditya Owner","2024-01-01T00:00:00Z","2024-06-01T10:00:00Z","true"],
      ]});
    }
    return HttpResponse.json({ range, majorDimension: "ROWS", values: [] });
  }),
  http.post(`${MOCK_SHEETS_BASE}/:spreadsheetId/values/:range:append`, () => HttpResponse.json({ updates: { updatedRows: 1, updatedColumns: 10, updatedCells: 10 } })),
  http.put(`${MOCK_SHEETS_BASE}/:spreadsheetId/values/:range`, () => HttpResponse.json({ updatedRows: 1, updatedColumns: 10, updatedCells: 10 })),
];
