const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

// ========= الإعدادات =========
const folderPath = '.';                           // المجلد الحالي
const outputFile = 'output.txt';                  // الملف الناتج
const excludedFolders = ['node_modules', '.git']; // المجلدات المستبعدة
const excludedFiles = ['output.txt', 'app.js'];   // الملفات المستبعدة (تجنب قراءة الملف الناتج والكود نفسه)
const fileExtensions = ['*'];                     // الامتدادات المسموحة
// =================================

async function readAllFiles(folder, outputFile, excludedDirs, excludedF, extensions) {
  const results = [];
  const stats = { files: 0, skippedFolders: 0, errors: 0 };
  const absoluteFolder = path.resolve(folder);
  const absoluteOutput = path.resolve(outputFile);

  async function traverse(currentPath) {
    let entries;
    try {
      entries = await fsPromises.readdir(currentPath, { withFileTypes: true });
    } catch (err) {
      console.log(`⚠️  تعذرت قراءة المجلد: ${currentPath}`);
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      const absoluteFull = path.resolve(fullPath);
      const relativePath = path.relative(absoluteFolder, absoluteFull);

      if (entry.isDirectory()) {
        if (excludedDirs.includes(entry.name)) {
          console.log(`⛔ تم استثناء المجلد: ${relativePath || entry.name}`);
          stats.skippedFolders++;
          continue;
        }
        await traverse(fullPath);
        continue;
      }

      // استبعاد ملف الناتج نفسه
      if (absoluteFull === absoluteOutput) continue;

      // استبعاد الملفات المحددة
      if (excludedF.includes(entry.name)) {
        console.log(`⏭️  تم استثناء الملف: ${relativePath}`);
        continue;
      }

      // فلترة الامتدادات
      if (extensions[0] !== '*') {
        const ext = path.extname(entry.name).toLowerCase();
        if (!extensions.includes(ext)) continue;
      }

      try {
        const content = await fsPromises.readFile(fullPath, 'utf-8');
        const separator = '='.repeat(70);

        results.push(
          `\n${separator}\n` +
          `📄 الملف: ${relativePath}\n` +
          `📍 المسار الكامل: ${absoluteFull}\n` +
          `${separator}\n${content}`
        );

        stats.files++;
        console.log(`✅ ${relativePath}`);
      } catch (err) {
        stats.errors++;
        console.log(`❌ تعذرت قراءة: ${relativePath} - ${err.message}`);
      }
    }
  }

  if (!fs.existsSync(absoluteFolder)) {
    throw new Error(`المجلد "${absoluteFolder}" غير موجود!`);
  }

  const startTime = Date.now();
  await traverse(absoluteFolder);
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  // كتابة الملف الناتج
  const header = 
    `╔══════════════════════════════════════════════════════╗\n` +
    `║       تقرير قراءة محتويات المجلد                    ║\n` +
    `╚══════════════════════════════════════════════════════╝\n` +
    `📅 تاريخ الإنشاء: ${new Date().toLocaleString('ar-EG')}\n` +
    `📂 المجلد المصدر: ${absoluteFolder}\n` +
    `🚫 المجلدات المستبعدة: ${excludedDirs.join(', ') || 'لا يوجد'}\n` +
    `⏱️  وقت التنفيذ: ${duration} ثانية\n` +
    `📊 عدد الملفات: ${stats.files}\n` +
    `📁 عدد المجلدات المستبعدة: ${stats.skippedFolders}\n` +
    `⚠️  أخطاء القراءة: ${stats.errors}\n`;

  await fsPromises.writeFile(outputFile, header + results.join('\n'), 'utf-8');

  console.log(`\n${'='.repeat(50)}`);
  console.log(`🎉 انتهى التنفيذ بنجاح!`);
  console.log(`📊 الملفات المعالجة: ${stats.files}`);
  console.log(`🚫 المجلدات المستبعدة: ${stats.skippedFolders}`);
  console.log(`⚠️  أخطاء: ${stats.errors}`);
  console.log(`⏱️  الوقت: ${duration} ثانية`);
  console.log(`💾 الملف الناتج: ${absoluteOutput}`);
}

// تشغيل
readAllFiles(folderPath, outputFile, excludedFolders, excludedFiles, fileExtensions)
  .catch(err => {
    console.error(`❌ خطأ: ${err.message}`);
    process.exit(1);
  });