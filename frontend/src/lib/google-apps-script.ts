/**
 * Generates the full Google Apps Script for ZIDCOD Sheets Auto-Sync
 * Aligned with the official ZIDCOD Orders Template:
 * Columns:
 * A: Product SKU
 * B: Customer Name
 * C: Phone Number
 * D: City (with Moroccan cities dropdown validation)
 * E: Full Address
 * F: Price (e.g. 199 DH)
 * G: Quantity
 * H: Notes
 * I: Sync Status
 */
export function generateZidcodAppsScript(token: string, apiUrl: string): string {
  return `var TOKEN = '${token}';
var API_URL = '${apiUrl}';

var SHEET_NAME = 'zidcod_orders_template';
var ALT_SHEET_NAMES = ['zidcod_orders_template.csv', 'Leads', 'ZIDCOD Leads', 'Orders'];

var LOG_SHEET_NAME = 'Sync Log';
var OLD_LOG_SHEET_NAME = 'ZIDCOD Sync Log';

var DUPLICATE_WINDOW_HOURS = 24;
var DUPLICATE_WINDOW_MS = DUPLICATE_WINDOW_HOURS * 60 * 60 * 1000;

var MOROCCAN_CITIES = [
  'Casablanca',
  'Rabat',
  'Marrakech',
  'Fès',
  'Tanger',
  'Agadir',
  'Meknès',
  'Oujda',
  'Kénitra',
  'Tétouan',
  'Safi',
  'Mohammédia',
  'El Jadida',
  'Béni Mellal',
  'Nador',
  'Khouribga',
  'Settat',
  'Témara',
  'Salé',
  'Laâyoune',
  'Dakhla',
  'Taza',
  'Berrechid',
  'Khemisset',
  'Guelmim',
  'Larache',
  'Ksar El Kebir',
  'Ouarzazate'
];

/*
 * Official ZIDCOD Template Headers:
 * A: Product SKU
 * B: Customer Name
 * C: Phone Number
 * D: City
 * E: Full Address
 * F: Price
 * G: Quantity
 * H: Notes
 * I: Sync Status
 */
var HEADERS = [
  'Product SKU',
  'Customer Name',
  'Phone Number',
  'City',
  'Full Address',
  'Price',
  'Quantity',
  'Notes',
  'Sync Status'
];

var LOG_HEADERS = [
  'Phone',
  'SKU',
  'Duplicate Key',
  'Order No.',
  'API Order No.',
  'Synced At',
  'Source Row'
];

function onOpen() {
  getOrCreateSheet();
  getOrCreateLogSheet();
  SpreadsheetApp.getUi()
    .createMenu('Zidcod')
    .addItem('📤 Send Leads', 'sendLeads')
    .addSeparator()
    .addItem('⏱ Auto-Sync Every 1 Hour', 'enableAutoSync1h')
    .addItem('⏱ Auto-Sync Every 3 Hours', 'enableAutoSync3h')
    .addItem('⏹ Turn Off Auto-Sync', 'disableAutoSync')
    .addToUi();
}

function setup() {
  getOrCreateSheet();
  getOrCreateLogSheet();
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    var handler = trigger.getHandlerFunction();
    if (handler === 'syncLeads' || handler === 'syncEditedLead' || handler === 'sendSelectedOrders' || handler === 'autoSendLeads') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  installAutoSyncTrigger(3);
  onOpen();
  SpreadsheetApp.getUi().alert(
    '✅ ZIDCOD Template Ready!\\n\\nLeads are synchronized automatically every 3 hours, and you can also send anytime with:\\nZidcod > 📤 Send Leads\\n\\nChange schedule or turn off from Zidcod > ⏱ Auto-Sync.'
  );
}

function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    for (var i = 0; i < ALT_SHEET_NAMES.length; i++) {
      var alt = ss.getSheetByName(ALT_SHEET_NAMES[i]);
      if (alt) { sheet = alt; break; }
    }
  }

  if (!sheet) {
    sheet = ss.getActiveSheet();
    if (sheet && sheet.getName() === LOG_SHEET_NAME) {
      sheet = ss.insertSheet(SHEET_NAME);
    }
  }

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  if (sheet.getMaxColumns() < HEADERS.length) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), HEADERS.length - sheet.getMaxColumns());
  }

  // Check if first row already has headers
  var firstRowValues = sheet.getRange(1, 1, 1, HEADERS.length).getDisplayValues()[0];
  var needsHeaders = false;
  if (!firstRowValues[0] || firstRowValues[0].trim() === '' || String(firstRowValues[0]).indexOf('ID') !== -1) {
    needsHeaders = true;
  }

  if (needsHeaders) {
    var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setValues([HEADERS])
      .setFontWeight('bold')
      .setFontSize(10)
      .setFontFamily('Roboto')
      .setBackground('#1b1136')
      .setFontColor('#ffffff')
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle')
      .setWrap(false);
  }

  sheet.setFrozenRows(1);

  // Set friendly column widths
  sheet.setColumnWidth(1, 150);  // Product SKU
  sheet.setColumnWidth(2, 170);  // Customer Name
  sheet.setColumnWidth(3, 160);  // Phone Number
  sheet.setColumnWidth(4, 150);  // City
  sheet.setColumnWidth(5, 260);  // Full Address
  sheet.setColumnWidth(6, 120);  // Price
  sheet.setColumnWidth(7, 90);   // Quantity
  sheet.setColumnWidth(8, 240);  // Notes
  sheet.setColumnWidth(9, 210);  // Sync Status

  sheet.setRowHeight(1, 32);
  var availableRows = Math.max(sheet.getMaxRows() - 1, 1);
  sheet.setRowHeights(2, availableRows, 28);

  // Column C: Plain text format for Phone
  sheet.getRange(2, 3, availableRows, 1).setNumberFormat('@');
  // Column G: Number format for Quantity
  sheet.getRange(2, 7, availableRows, 1).setNumberFormat('0');

  // Add City dropdown data validation to Column D
  var cityRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(MOROCCAN_CITIES, true)
    .setAllowInvalid(true)
    .build();
  sheet.getRange(2, 4, availableRows, 1).setDataValidation(cityRule);

  // Alignments
  sheet.getRange(2, 1, availableRows, 9).setWrap(false).setVerticalAlignment('middle');
  sheet.getRange(2, 1, availableRows, 1).setHorizontalAlignment('left');   // SKU
  sheet.getRange(2, 2, availableRows, 1).setHorizontalAlignment('left');   // Customer Name
  sheet.getRange(2, 3, availableRows, 1).setHorizontalAlignment('center'); // Phone
  sheet.getRange(2, 4, availableRows, 1).setHorizontalAlignment('left');   // City
  sheet.getRange(2, 5, availableRows, 1).setHorizontalAlignment('left');   // Address
  sheet.getRange(2, 6, availableRows, 1).setHorizontalAlignment('right');  // Price
  sheet.getRange(2, 7, availableRows, 1).setHorizontalAlignment('center'); // Quantity
  sheet.getRange(2, 8, availableRows, 1).setHorizontalAlignment('left');   // Notes
  sheet.getRange(2, 9, availableRows, 1).setHorizontalAlignment('left');   // Sync Status

  fixExistingPhoneFormat(sheet, availableRows);
  return sheet;
}

function fixExistingPhoneFormat(sheet, availableRows) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  var colMap = getColumnMap(sheet);
  var phoneCol = colMap.phone + 1;
  var rows = lastRow - 1;
  var phoneRange = sheet.getRange(2, phoneCol, rows, 1);
  var phoneValues = phoneRange.getDisplayValues();
  var fixed = [];
  for (var i = 0; i < phoneValues.length; i++) {
    fixed.push([normalizePhoneForSheet(phoneValues[i][0])]);
  }
  phoneRange.setNumberFormat('@').setValues(fixed);
}

function normalizePhoneForSheet(value) {
  var phone = String(value || '').trim().replace(/\\s+/g, '').replace(/[-().]/g, '');
  if (phone.indexOf('+212') === 0) { phone = '0' + phone.substring(4); }
  else if (phone.indexOf('212') === 0) { phone = '0' + phone.substring(3); }
  else if (/^[67]\\d{8}$/.test(phone)) { phone = '0' + phone; }
  return phone;
}

function onEdit(e) {
  if (!e || !e.range) return;
  var sheet = e.range.getSheet();
  if (sheet.getName() === LOG_SHEET_NAME || e.range.getRow() < 2) return;
  var colMap = getColumnMap(sheet);
  var phoneCol = colMap.phone + 1;
  var firstCol = e.range.getColumn();
  var lastCol = firstCol + e.range.getNumColumns() - 1;

  if (firstCol <= phoneCol && lastCol >= phoneCol) {
    var phoneRange = sheet.getRange(e.range.getRow(), phoneCol, e.range.getNumRows(), 1);
    var vals = phoneRange.getDisplayValues();
    var fixed = [];
    for (var i = 0; i < vals.length; i++) { fixed.push([normalizePhoneForSheet(vals[i][0])]); }
    phoneRange.setNumberFormat('@').setValues(fixed);
  }
}

function getOrCreateLogSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var logSheet = ss.getSheetByName(LOG_SHEET_NAME);
  if (!logSheet) {
    var oldLog = ss.getSheetByName(OLD_LOG_SHEET_NAME);
    if (oldLog) { oldLog.setName(LOG_SHEET_NAME); logSheet = oldLog; }
  }
  if (!logSheet) { logSheet = ss.insertSheet(LOG_SHEET_NAME); }
  if (logSheet.getMaxColumns() < LOG_HEADERS.length) {
    logSheet.insertColumnsAfter(logSheet.getMaxColumns(), LOG_HEADERS.length - logSheet.getMaxColumns());
  }
  logSheet.getRange(1, 1, 1, LOG_HEADERS.length).setValues([LOG_HEADERS])
    .setFontWeight('bold').setBackground('#1b1136').setFontColor('#ffffff');
  logSheet.setFrozenRows(1);
  if (!logSheet.isSheetHidden()) logSheet.hideSheet();
  return logSheet;
}

/**
 * Dynamically resolves column positions by reading Row 1 headers
 */
function getColumnMap(sheet) {
  var lastCol = Math.max(sheet.getLastColumn(), HEADERS.length);
  var headers = sheet.getRange(1, 1, 1, lastCol).getDisplayValues()[0];
  var map = {
    sku: 0,
    customer: 1,
    phone: 2,
    city: 3,
    address: 4,
    price: 5,
    quantity: 6,
    note: 7,
    status: 8
  };

  for (var i = 0; i < headers.length; i++) {
    var h = String(headers[i] || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (h.indexOf('sku') !== -1 || h.indexOf('product') !== -1) map.sku = i;
    else if (h.indexOf('customer') !== -1 || h.indexOf('client') !== -1 || (h.indexOf('name') !== -1 && h.indexOf('product') === -1)) map.customer = i;
    else if (h.indexOf('phone') !== -1 || h.indexOf('tel') !== -1 || h.indexOf('mobile') !== -1) map.phone = i;
    else if (h.indexOf('city') !== -1 || h.indexOf('ville') !== -1) map.city = i;
    else if (h.indexOf('address') !== -1 || h.indexOf('adresse') !== -1) map.address = i;
    else if (h.indexOf('price') !== -1 || h.indexOf('prix') !== -1) map.price = i;
    else if (h.indexOf('qty') !== -1 || h.indexOf('quantity') !== -1 || h.indexOf('quantite') !== -1) map.quantity = i;
    else if (h.indexOf('note') !== -1 || h.indexOf('remarque') !== -1) map.note = i;
    else if (h.indexOf('status') !== -1 || h.indexOf('sync') !== -1) map.status = i;
  }
  return map;
}

function sendLeads() {
  sendLeadsCore(true);
}

function autoSendLeads() {
  sendLeadsCore(false);
}

function sendLeadsCore(showAlerts) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getOrCreateSheet();
  if (!sheet) { if (showAlerts) SpreadsheetApp.getUi().alert('❌ Leads sheet not found.'); return; }
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) { if (showAlerts) SpreadsheetApp.getUi().alert('ℹ️ No leads found to send.'); return; }

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) { if (showAlerts) SpreadsheetApp.getUi().alert('🔒 Another process is running. Please wait.'); return; }

  try {
    var logSheet = getOrCreateLogSheet();
    var recentOrdersMap = buildRecentOrdersMap(logSheet);
    var colMap = getColumnMap(sheet);
    var totalCols = Math.max(sheet.getLastColumn(), 9);
    var rows = sheet.getRange(2, 1, lastRow - 1, totalCols).getDisplayValues();
    var sentCount = 0, errorCount = 0, duplicateCount = 0, alreadySentCount = 0;

    for (var index = 0; index < rows.length; index++) {
      var rowNumber = index + 2;
      var fullRow = rows[index];
      var status = cleanValue(fullRow[colMap.status]);

      if (isRowEmpty(fullRow, colMap)) {
        clearGeneratedData(sheet, rowNumber, colMap.status);
        continue;
      }

      if (isSuccessfulStatus(status)) {
        alreadySentCount++;
        continue;
      }

      var result = processLeadRow(sheet, logSheet, rowNumber, fullRow, colMap, recentOrdersMap);
      if (result === 'sent') sentCount++;
      else if (result === 'duplicate') duplicateCount++;
      else if (result === 'error') errorCount++;
    }

    if (showAlerts) {
      SpreadsheetApp.getUi().alert(
        '📦 ZIDCOD Sync Completed\\n\\n' +
        '✅ Sent: ' + sentCount + '\\n' +
        '❌ Errors: ' + errorCount + '\\n' +
        '🔁 Duplicates: ' + duplicateCount + '\\n' +
        '⏭️ Already sent: ' + alreadySentCount
      );
    }
  } finally {
    lock.releaseLock();
  }
}

function installAutoSyncTrigger(hours) {
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'autoSendLeads') ScriptApp.deleteTrigger(trigger);
  });
  ScriptApp.newTrigger('autoSendLeads').timeBased().everyHours(hours).create();
}

function setAutoSyncInterval(hours) {
  installAutoSyncTrigger(hours);
  SpreadsheetApp.getUi().alert('✅ Auto-Sync enabled — leads will sync every ' + hours + ' hour' + (hours > 1 ? 's' : '') + '.');
}

function disableAutoSync() {
  var found = false;
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'autoSendLeads') { ScriptApp.deleteTrigger(trigger); found = true; }
  });
  SpreadsheetApp.getUi().alert(found ? '⏹ Auto-Sync turned off.' : 'ℹ️ Auto-Sync was not active.');
}

function enableAutoSync1h() { setAutoSyncInterval(1); }
function enableAutoSync3h() { setAutoSyncInterval(3); }

function isRowEmpty(fullRow, colMap) {
  var sku = cleanValue(fullRow[colMap.sku]);
  var name = cleanValue(fullRow[colMap.customer]);
  var phone = cleanValue(fullRow[colMap.phone]);
  return !sku && !name && !phone;
}

function processLeadRow(sheet, logSheet, rowNumber, fullRow, colMap, recentOrdersMap) {
  var lead = {
    sku:      cleanValue(fullRow[colMap.sku]),
    customer: cleanValue(fullRow[colMap.customer]),
    phone:    normalizePhone(fullRow[colMap.phone]),
    city:     cleanValue(fullRow[colMap.city]) || 'Casablanca',
    address:  cleanValue(fullRow[colMap.address]),
    price:    cleanValue(fullRow[colMap.price]),
    quantity: normalizeQuantityForApi(fullRow[colMap.quantity]),
    note:     cleanValue(fullRow[colMap.note])
  };

  var validationError = validateLead(lead);
  if (validationError) {
    setStatus(sheet, rowNumber, colMap.status, '❌ ' + validationError);
    return 'error';
  }

  var duplicateKey = createDuplicateKey(lead.phone, lead.sku);
  var lastSuccessfulTime = recentOrdersMap[duplicateKey];
  if (lastSuccessfulTime) {
    var elapsedMs = Date.now() - lastSuccessfulTime;
    var remainingMs = DUPLICATE_WINDOW_MS - elapsedMs;
    if (remainingMs > 0) {
      setStatus(sheet, rowNumber, colMap.status, '🔁 Duplicate • ' + formatRemainingTime(remainingMs));
      return 'duplicate';
    }
    delete recentOrdersMap[duplicateKey];
  }

  var orderNumber = generateOrderNumber();
  var internalId = generateInternalId();

  try {
    setStatus(sheet, rowNumber, colMap.status, '📤 Sending...');
    SpreadsheetApp.flush();

    // Sends official template format: [sku, customer, phone, city, address, price, quantity, note]
    var apiRow = [
      lead.sku,
      lead.customer,
      lead.phone,
      lead.city,
      lead.address,
      normalizePriceForApi(lead.price),
      lead.quantity,
      lead.note,
      orderNumber,
      internalId
    ];

    var response = UrlFetchApp.fetch(API_URL, {
      method: 'post',
      contentType: 'application/json',
      muteHttpExceptions: true,
      headers: { Accept: 'application/json' },
      payload: JSON.stringify({ token: TOKEN, row: apiRow })
    });

    var responseCode = response.getResponseCode();
    var result = safeJsonParse(response.getContentText());

    if (responseCode >= 200 && responseCode < 300) {
      var apiOrderNumber = result.order_number || result.orderNumber || result.id || orderNumber;
      var syncedAt = new Date();
      setStatus(sheet, rowNumber, colMap.status, '✅ Synced • ' + apiOrderNumber);
      addSuccessfulOrderToLog(logSheet, lead.phone, lead.sku, duplicateKey, orderNumber, apiOrderNumber, syncedAt, rowNumber);
      recentOrdersMap[duplicateKey] = syncedAt.getTime();
      return 'sent';
    }

    var apiError = result.error || result.message || 'Server error ' + responseCode;
    setStatus(sheet, rowNumber, colMap.status, '❌ ' + cleanApiError(apiError));
    return 'error';

  } catch (error) {
    setStatus(sheet, rowNumber, colMap.status, '⚠️ Network error • Try again');
    return 'error';
  }
}

function generateOrderNumber() {
  var timezone = Session.getScriptTimeZone() || 'Africa/Casablanca';
  var today = Utilities.formatDate(new Date(), timezone, 'yyMMdd');
  var props = PropertiesService.getScriptProperties();
  var savedDate = props.getProperty('ORDER_DATE');
  var sequence = parseInt(props.getProperty('ORDER_SEQUENCE') || '0', 10);
  if (savedDate !== today) { sequence = 0; props.setProperty('ORDER_DATE', today); }
  sequence++;
  props.setProperty('ORDER_SEQUENCE', String(sequence));
  return 'COD-' + today + String(sequence).padStart(3, '0');
}

function generateInternalId() {
  return 'LD-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
}

function addSuccessfulOrderToLog(logSheet, phone, sku, duplicateKey, orderNumber, apiOrderNumber, syncedAt, sourceRow) {
  logSheet.appendRow([phone, sku, duplicateKey, orderNumber, apiOrderNumber, syncedAt, sourceRow]);
  logSheet.getRange(logSheet.getLastRow(), 6).setNumberFormat('yyyy-MM-dd HH:mm:ss');
}

function buildRecentOrdersMap(logSheet) {
  var map = {};
  var lastRow = logSheet.getLastRow();
  if (lastRow < 2) return map;
  var logRows = logSheet.getRange(2, 1, lastRow - 1, LOG_HEADERS.length).getValues();
  for (var i = 0; i < logRows.length; i++) {
    var phone = normalizePhone(logRows[i][0]);
    var sku = cleanValue(logRows[i][1]);
    var savedKey = cleanValue(logRows[i][2]);
    var duplicateKey = savedKey || createDuplicateKey(phone, sku);
    var syncedAt = logRows[i][5];
    if (!isValidDateValue(syncedAt) && isValidDateValue(logRows[i][4])) syncedAt = logRows[i][4];
    if (!duplicateKey || !isValidDateValue(syncedAt)) continue;
    var syncedTime = new Date(syncedAt).getTime();
    if (!map[duplicateKey] || syncedTime > map[duplicateKey]) map[duplicateKey] = syncedTime;
  }
  return map;
}

function validateLead(lead) {
  if (!lead.sku) return 'SKU missing';
  if (!lead.customer) return 'Customer Name missing';
  if (!lead.phone) return 'Phone missing';
  if (!isValidMoroccanPhone(lead.phone)) return 'Invalid phone';
  if (!lead.address) return 'Address missing';
  if (!lead.price) return 'Price missing';
  if (!isValidPrice(lead.price)) return 'Invalid price';
  return '';
}

function isValidMoroccanPhone(phone) { return /^0[67]\\d{8}$/.test(phone); }

function normalizePhone(value) {
  var phone = String(value || '').trim().replace(/\\s+/g, '').replace(/[-().]/g, '');
  if (phone.indexOf('+212') === 0) phone = '0' + phone.substring(4);
  else if (phone.indexOf('212') === 0) phone = '0' + phone.substring(3);
  return phone;
}

function isValidPrice(price) {
  var n = Number(normalizePriceForApi(price));
  return !isNaN(n) && n > 0;
}

function normalizePriceForApi(price) {
  return String(price || '').replace(/\\s/g, '').replace(',', '.').replace(/[^\\d.]/g, '');
}

function normalizeQuantityForApi(quantity) {
  var cleaned = String(quantity || '').trim().replace(/[^\\d]/g, '');
  if (!cleaned) return 1;
  var n = parseInt(cleaned, 10);
  return (isNaN(n) || n < 1) ? 1 : n;
}

function createDuplicateKey(phone, sku) { return normalizePhone(phone) + '||' + normalizeSku(sku); }

function normalizeSku(value) {
  return String(value || '').trim().toLowerCase().replace(/\\s+/g, '').replace(/[-_/\\\\.,،؛:()[\\]{}]/g, '');
}

function isSuccessfulStatus(status) {
  status = cleanValue(status);
  return status.indexOf('✅') === 0 || status.indexOf('✓') === 0;
}

function setStatus(sheet, rowNumber, statusColIdx, statusText) {
  var col = (statusColIdx !== undefined ? statusColIdx : 8) + 1;
  var cell = sheet.getRange(rowNumber, col);
  cell.setValue(statusText).setFontWeight('bold').setVerticalAlignment('middle').setHorizontalAlignment('left').setWrap(false);
  if (statusText.indexOf('✅') === 0)      { cell.setBackground('#d1fae5'); cell.setFontColor('#065f46'); }
  else if (statusText.indexOf('📤') === 0) { cell.setBackground('#dbeafe'); cell.setFontColor('#1e40af'); }
  else if (statusText.indexOf('🔁') === 0) { cell.setBackground('#fef3c7'); cell.setFontColor('#92400e'); }
  else if (statusText.indexOf('⚠️') === 0) { cell.setBackground('#ffedd5'); cell.setFontColor('#9a3412'); }
  else if (statusText.indexOf('❌') === 0) { cell.setBackground('#fee2e2'); cell.setFontColor('#991b1b'); }
}

function clearGeneratedData(sheet, rowNumber, statusColIdx) {
  var col = (statusColIdx !== undefined ? statusColIdx : 8) + 1;
  var cell = sheet.getRange(rowNumber, col);
  cell.clearContent(); cell.setBackground(null); cell.setFontColor(null); cell.setFontWeight('normal');
}

function formatRemainingTime(ms) {
  var totalMinutes = Math.ceil(ms / 60000);
  var hours = Math.floor(totalMinutes / 60);
  var minutes = totalMinutes % 60;
  if (hours > 0 && minutes > 0) return hours + 'h ' + minutes + 'm remaining';
  if (hours > 0) return hours + 'h remaining';
  return minutes + 'm remaining';
}

function cleanApiError(errorText) {
  var cleaned = String(errorText || 'Unknown error').replace(/forcelog/gi, 'Delivery service').replace(/zonecod/gi, 'Server').replace(/zidcod/gi, 'Server').trim();
  if (cleaned.length > 140) cleaned = cleaned.substring(0, 140) + '...';
  return cleaned;
}

function cleanValue(value) { return String(value || '').trim(); }

function isValidDateValue(value) {
  if (!value) return false;
  return !isNaN(new Date(value).getTime());
}

function safeJsonParse(text) {
  if (!text) return {};
  try { return JSON.parse(text); } catch (e) { return { message: String(text).substring(0, 200) }; }
}
`;
}
