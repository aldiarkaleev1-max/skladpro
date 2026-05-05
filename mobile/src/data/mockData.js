export const initialInventory = [
  { id: '1', sku: 'PRD-001', name: 'Ноутбук Dell XPS 15', category: 'Электроника', quantity: 15, price: 150000, supplier: 'ТехноПоставка', location: 'Склад А' },
  { id: '2', sku: 'PRD-002', name: 'Мышь Logitech MX Master 3', category: 'Аксессуары', quantity: 45, price: 8000, supplier: 'КомпьютерТрейд', location: 'Склад Б' },
  { id: '3', sku: 'PRD-003', name: 'Клавиатура Keychron K2', category: 'Аксессуары', quantity: 5, price: 9500, supplier: 'КомпьютерТрейд', location: 'Склад А' },
  { id: '4', sku: 'PRD-004', name: 'Монитор LG UltraGear 27"', category: 'Электроника', quantity: 0, price: 35000, supplier: 'ТехноПоставка', location: 'Склад А' },
  { id: '5', sku: 'PRD-005', name: 'Кабель HDMI 2.1 (2м)', category: 'Кабели', quantity: 120, price: 1200, supplier: 'КабельОпт', location: 'Склад В' },
  { id: '6', sku: 'PRD-006', name: 'SSD Samsung 970 EVO 1TB', category: 'Комплектующие', quantity: 30, price: 25000, supplier: 'ТехноПоставка', location: 'Склад А' },
  { id: '7', sku: 'PRD-007', name: 'Оперативная память DDR4 16GB', category: 'Комплектующие', quantity: 8, price: 12000, supplier: 'ТехноПоставка', location: 'Склад Б' },
  { id: '8', sku: 'PRD-008', name: 'Веб-камера Logitech C920', category: 'Аксессуары', quantity: 22, price: 7500, supplier: 'КомпьютерТрейд', location: 'Склад Б' },
  { id: '9', sku: 'PRD-009', name: 'USB-хаб 7 портов', category: 'Аксессуары', quantity: 3, price: 3500, supplier: 'КабельОпт', location: 'Склад В' },
  { id: '10', sku: 'PRD-010', name: 'Блок питания 750W', category: 'Комплектующие', quantity: 0, price: 18000, supplier: 'ТехноПоставка', location: 'Склад А' },
  { id: '11', sku: 'PRD-011', name: 'Кабель USB-C (1м)', category: 'Кабели', quantity: 200, price: 800, supplier: 'КабельОпт', location: 'Склад В' },
  { id: '12', sku: 'PRD-012', name: 'Наушники Sony WH-1000XM5', category: 'Электроника', quantity: 12, price: 45000, supplier: 'ТехноПоставка', location: 'Склад А' },
];

export const initialTransactions = [
  { id: '1', date: '2026-04-25T16:00:00Z', type: 'in', itemId: '1', quantity: 10, note: 'Поступление от ТехноПоставка' },
  { id: '2', date: '2026-04-25T14:30:00Z', type: 'out', itemId: '2', quantity: 5, note: 'Отгрузка в филиал №2' },
  { id: '3', date: '2026-04-24T11:00:00Z', type: 'in', itemId: '6', quantity: 15, note: 'Плановая поставка' },
  { id: '4', date: '2026-04-24T09:00:00Z', type: 'out', itemId: '3', quantity: 3, note: 'Продажа клиенту' },
  { id: '5', date: '2026-04-23T15:20:00Z', type: 'out', itemId: '12', quantity: 2, note: 'Выдача сотрудникам' },
  { id: '6', date: '2026-04-23T10:00:00Z', type: 'in', itemId: '5', quantity: 50, note: 'Поступление от КабельОпт' },
  { id: '7', date: '2026-04-22T14:15:00Z', type: 'out', itemId: '1', quantity: 5, note: 'Отгрузка клиенту' },
  { id: '8', date: '2026-04-22T09:30:00Z', type: 'in', itemId: '8', quantity: 10, note: 'Поступление' },
  { id: '9', date: '2026-04-21T16:45:00Z', type: 'out', itemId: '7', quantity: 4, note: 'Списание (брак)' },
  { id: '10', date: '2026-04-20T10:30:00Z', type: 'in', itemId: '11', quantity: 100, note: 'Крупная поставка кабелей' },
];

export const initialSuppliers = [
  { id: '1', name: 'ТехноПоставка', contact: 'Иванов А.С.', phone: '+7 (701) 123-45-67', email: 'info@techpost.kz', address: 'г. Алматы, ул. Абая 150', itemsCount: 5 },
  { id: '2', name: 'КомпьютерТрейд', contact: 'Петров Б.В.', phone: '+7 (702) 234-56-78', email: 'sales@comptrade.kz', address: 'г. Алматы, пр. Назарбаева 45', itemsCount: 3 },
  { id: '3', name: 'КабельОпт', contact: 'Сидорова Г.Д.', phone: '+7 (705) 345-67-89', email: 'opt@kabelopt.kz', address: 'г. Астана, ул. Кенесары 100', itemsCount: 3 },
];

export const categories = ['Электроника', 'Аксессуары', 'Кабели', 'Комплектующие'];
export const locations = ['Склад А', 'Склад Б', 'Склад В'];
