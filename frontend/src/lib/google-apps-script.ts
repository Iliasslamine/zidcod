/**
 * Generates the full Google Apps Script for ZIDCOD Sheets Auto-Sync
 * Extracted and aligned with original Zonecod strategy.
 */
export function generateZidcodAppsScript(token: string, apiUrl: string): string {
  return `var TOKEN = '${token}';
var API_URL = '${apiUrl}';

var SHEET_NAME = 'Leads';
var OLD_SHEET_NAME = 'ZIDCOD Leads';

var LOG_SHEET_NAME = 'Sync Log';
var OLD_LOG_SHEET_NAME = 'ZIDCOD Sync Log';

var DUPLICATE_WINDOW_HOURS = 24;
var DUPLICATE_WINDOW_MS = DUPLICATE_WINDOW_HOURS * 60 * 60 * 1000;

/*
 * Columns:
 * A = Customer
 * B = Phone
 * C = City
 * D = Address
 * E = Price
 * F = Qty
 * G = SKU
 * H = Note
 * I = Status
 */
var HEADERS = [
  '👤 Customer',
  '📞 Phone',
  '🏙️ City',
  '📍 Address',
  '💰 Price',
  '🔢 Qty',
  '🏷️ SKU',
  '📝 Note',
  '📊 Status'
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
    '✅ Ready!\\n\\nLeads are sent automatically every 3 hours, and you can also send anytime with:\\nZidcod > 📤 Send Leads\\n\\nChange the schedule to 1 hour, or turn it off, from Zidcod > ⏱ Auto-Sync.'
  );
}

function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    var oldSheet = ss.getSheetByName(OLD_SHEET_NAME);
    if (oldSheet) { oldSheet.setName(SHEET_NAME); sheet = oldSheet; }
  }
  if (!sheet) { sheet = ss.insertSheet(SHEET_NAME); }

  var firstHeaders = sheet.getRange(1, 1, 1, Math.min(sheet.getMaxColumns(), 2)).getDisplayValues()[0];
  if (String(firstHeaders[0] || '').indexOf('ID') !== -1 && String(firstHeaders[1] || '').indexOf('Order No.') !== -1) {
    sheet.deleteColumns(1, 2);
  }

  if (sheet.getMaxColumns() < HEADERS.length) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), HEADERS.length - sheet.getMaxColumns());
  }

  var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  headerRange.setValues([HEADERS]).setFontWeight('bold').setFontSize(10).setFontFamily('Arial')
    .setBackground('#7c3aed').setFontColor('#ffffff').setHorizontalAlignment('center')
    .setVerticalAlignment('middle').setWrap(false);
  sheet.setFrozenRows(1);

  sheet.setColumnWidth(1, 180);  // Customer
  sheet.setColumnWidth(2, 155);  // Phone
  sheet.setColumnWidth(3, 185);  // City
  sheet.setColumnWidth(4, 300);  // Address
  sheet.setColumnWidth(5, 115);  // Price
  sheet.setColumnWidth(6, 80);   // Qty
  sheet.setColumnWidth(7, 200);  // SKU
  sheet.setColumnWidth(8, 310);  // Note
  sheet.setColumnWidth(9, 380);  // Status

  sheet.setRowHeight(1, 30);
  var availableRows = Math.max(sheet.getMaxRows() - 1, 1);
  sheet.setRowHeights(2, availableRows, 26);

  sheet.getRange(2, 2, availableRows, 1).setNumberFormat('@');  // Phone plain text
  sheet.getRange(2, 5, availableRows, 1).setNumberFormat('0');  // Price
  sheet.getRange(2, 6, availableRows, 1).setNumberFormat('0');  // Qty
  sheet.getRange(2, 7, availableRows, 1).setNumberFormat('@');  // SKU

  sheet.getRange(2, 1, availableRows, 9).setWrap(false).setVerticalAlignment('middle');
  sheet.getRange(2, 1, availableRows, 1).setHorizontalAlignment('left');
  sheet.getRange(2, 2, availableRows, 1).setHorizontalAlignment('center');
  sheet.getRange(2, 3, availableRows, 1).setHorizontalAlignment('left');
  sheet.getRange(2, 4, availableRows, 1).setHorizontalAlignment('left');
  sheet.getRange(2, 5, availableRows, 1).setHorizontalAlignment('center');
  sheet.getRange(2, 6, availableRows, 1).setHorizontalAlignment('center');
  sheet.getRange(2, 7, availableRows, 1).setHorizontalAlignment('center');
  sheet.getRange(2, 8, availableRows, 1).setHorizontalAlignment('left');
  sheet.getRange(2, 9, availableRows, 1).setHorizontalAlignment('left');

  fixExistingPhoneFormat(sheet, availableRows);
  return sheet;
}

function fixExistingPhoneFormat(sheet, availableRows) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  var rows = lastRow - 1;
  var phoneRange = sheet.getRange(2, 2, rows, 1);
  var phoneValues = phoneRange.getDisplayValues();
  var fixed = [];
  for (var i = 0; i < phoneValues.length; i++) {
    fixed.push([normalizePhoneForSheet(phoneValues[i][0])]);
  }
  phoneRange.setNumberFormat('@').setValues(fixed);
  sheet.getRange(2, 5, rows, 1).setNumberFormat('0');
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
  if (sheet.getName() !== SHEET_NAME || e.range.getRow() < 2) return;
  var firstCol = e.range.getColumn();
  var lastCol = firstCol + e.range.getNumColumns() - 1;

  if (firstCol <= 2 && lastCol >= 2) {
    var phoneRange = sheet.getRange(e.range.getRow(), 2, e.range.getNumRows(), 1);
    var vals = phoneRange.getDisplayValues();
    var fixed = [];
    for (var i = 0; i < vals.length; i++) { fixed.push([normalizePhoneForSheet(vals[i][0])]); }
    phoneRange.setNumberFormat('@').setValues(fixed);
  }
  if (firstCol <= 5 && lastCol >= 5) {
    sheet.getRange(e.range.getRow(), 5, e.range.getNumRows(), 1).setNumberFormat('0');
  }
  if (firstCol <= 6 && lastCol >= 6) {
    sheet.getRange(e.range.getRow(), 6, e.range.getNumRows(), 1).setNumberFormat('0');
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
    .setFontWeight('bold').setBackground('#101b39').setFontColor('#ffffff');
  logSheet.setFrozenRows(1);
  if (!logSheet.isSheetHidden()) logSheet.hideSheet();
  return logSheet;
}

function sendLeads() {
  sendLeadsCore(true);
}

function autoSendLeads() {
  sendLeadsCore(false);
}

function sendLeadsCore(showAlerts) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) { if (showAlerts) SpreadsheetApp.getUi().alert('❌ Leads sheet not found.'); return; }
  getOrCreateSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) { if (showAlerts) SpreadsheetApp.getUi().alert('ℹ️ No leads found.'); return; }

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) { if (showAlerts) SpreadsheetApp.getUi().alert('🔒 Another process is running.'); return; }

  try {
    var logSheet = getOrCreateLogSheet();
    var recentOrdersMap = buildRecentOrdersMap(logSheet);
    var rows = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getDisplayValues();
    var sentCount = 0, errorCount = 0, duplicateCount = 0, alreadySentCount = 0;

    for (var index = 0; index < rows.length; index++) {
      var rowNumber = index + 2;
      var fullRow = rows[index];
      var data = fullRow.slice(0, 8);
      var status = cleanValue(fullRow[8]);

      if (isCompletelyBlank(data)) { clearGeneratedData(sheet, rowNumber); continue; }
      if (isSuccessfulStatus(status)) { alreadySentCount++; continue; }

      var result = processLeadRow(sheet, logSheet, rowNumber, data, recentOrdersMap);
      if (result === 'sent') sentCount++;
      else if (result === 'duplicate') duplicateCount++;
      else if (result === 'error') errorCount++;
    }

    if (showAlerts) {
      SpreadsheetApp.getUi().alert(
        '📦 Sending completed\\n\\n' +
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
  SpreadsheetApp.getUi().alert('✅ Auto-Sync enabled — leads will be sent automatically every ' + hours + ' hour' + (hours > 1 ? 's' : '') + '.\\n\\nYou can still use Zidcod > 📤 Send Leads any time.');
}

function disableAutoSync() {
  var found = false;
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'autoSendLeads') { ScriptApp.deleteTrigger(trigger); found = true; }
  });
  SpreadsheetApp.getUi().alert(found ? '⏹ Auto-Sync turned off.' : 'ℹ️ Auto-Sync was not on.');
}

function enableAutoSync1h() { setAutoSyncInterval(1); }
function enableAutoSync3h() { setAutoSyncInterval(3); }

function processLeadRow(sheet, logSheet, rowNumber, data, recentOrdersMap) {
  var lead = {
    customer: cleanValue(data[0]),
    phone:    normalizePhone(data[1]),
    city:     cleanValue(data[2]),
    address:  cleanValue(data[3]),
    price:    cleanValue(data[4]),
    quantity: normalizeQuantityForApi(data[5]),
    sku:      cleanValue(data[6]),
    note:     cleanValue(data[7])
  };

  var validationError = validateLead(lead);
  if (validationError) { setStatus(sheet, rowNumber, '❌ ' + validationError); return 'error'; }

  var duplicateKey = createDuplicateKey(lead.phone, lead.sku);
  var lastSuccessfulTime = recentOrdersMap[duplicateKey];
  if (lastSuccessfulTime) {
    var elapsedMs = Date.now() - lastSuccessfulTime;
    var remainingMs = DUPLICATE_WINDOW_MS - elapsedMs;
    if (remainingMs > 0) {
      setStatus(sheet, rowNumber, '🔁 Duplicate • ' + formatRemainingTime(remainingMs));
      return 'duplicate';
    }
    delete recentOrdersMap[duplicateKey];
  }

  var orderNumber = generateOrderNumber();
  var internalId = generateInternalId();

  try {
    setStatus(sheet, rowNumber, '📤 Sending...');
    SpreadsheetApp.flush();

    var apiRow = [
      internalId,
      orderNumber,
      lead.customer,
      lead.phone,
      normalizePriceForApi(lead.price),
      lead.city,
      lead.address,
      lead.note,
      lead.sku,
      lead.quantity
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
      setStatus(sheet, rowNumber, '✅ Imported • ' + apiOrderNumber);
      addSuccessfulOrderToLog(logSheet, lead.phone, lead.sku, duplicateKey, orderNumber, apiOrderNumber, syncedAt, rowNumber);
      recentOrdersMap[duplicateKey] = syncedAt.getTime();
      return 'sent';
    }

    var apiError = result.error || result.message || 'Server error ' + responseCode;
    setStatus(sheet, rowNumber, '❌ ' + cleanApiError(apiError));
    return 'error';

  } catch (error) {
    setStatus(sheet, rowNumber, '⚠️ Connection error • Try again');
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
  if (!lead.customer) return 'Customer missing';
  if (!lead.phone) return 'Phone missing';
  if (!isValidMoroccanPhone(lead.phone)) return 'Invalid phone';
  if (!lead.city) return 'City missing';
  if (!lead.address) return 'Address missing';
  if (!lead.price) return 'Price missing';
  if (!isValidPrice(lead.price)) return 'Invalid price';
  if (!lead.sku) return 'SKU missing';
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

function setStatus(sheet, rowNumber, statusText) {
  var cell = sheet.getRange(rowNumber, 9);
  cell.setValue(statusText).setFontWeight('bold').setVerticalAlignment('middle').setHorizontalAlignment('left').setWrap(false);
  if (statusText.indexOf('✅') === 0)      { cell.setBackground('#d1fae5'); cell.setFontColor('#065f46'); }
  else if (statusText.indexOf('📤') === 0) { cell.setBackground('#dbeafe'); cell.setFontColor('#1e40af'); }
  else if (statusText.indexOf('🔁') === 0) { cell.setBackground('#fef3c7'); cell.setFontColor('#92400e'); }
  else if (statusText.indexOf('⚠️') === 0) { cell.setBackground('#ffedd5'); cell.setFontColor('#9a3412'); }
  else if (statusText.indexOf('❌') === 0) { cell.setBackground('#fee2e2'); cell.setFontColor('#991b1b'); }
}

function clearGeneratedData(sheet, rowNumber) {
  var cell = sheet.getRange(rowNumber, 9);
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

function isCompletelyBlank(data) {
  for (var i = 0; i < data.length; i++) { if (cleanValue(data[i]) !== '') return false; }
  return true;
}

function isValidDateValue(value) {
  if (!value) return false;
  return !isNaN(new Date(value).getTime());
}

function safeJsonParse(text) {
  if (!text) return {};
  try { return JSON.parse(text); } catch (e) { return { message: String(text).substring(0, 200) }; }
}`;
}
