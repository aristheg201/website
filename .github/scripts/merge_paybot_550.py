from pathlib import Path


def read(path: str) -> str:
    return Path(path).read_text(encoding="utf-8")


def write(path: str, text: str) -> None:
    Path(path).write_text(text, encoding="utf-8")


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected 1 occurrence, found {count}")
    return text.replace(old, new, 1)


# Preserve the /paybotreload command shipped in the uploaded 5.5.0 JAR.
p = Path("common/src/main/java/com/naptien/commands/CommandRegistry.java")
s = read(str(p))
s = replace_once(
    s,
    """        registerDisablePayBot(dispatcher);
        registerEnablePayBot(dispatcher);
    }""",
    """        registerDisablePayBot(dispatcher);
        registerEnablePayBot(dispatcher);
        registerPayBotReload(dispatcher);
    }""",
    "registerPayBotReload hook",
)
if not s.endswith("\n}"):
    raise SystemExit("CommandRegistry.java does not end with the class closing brace")
s = s[:-2] + """

    // ─── /paybotreload — reload và áp dụng config mà không restart ──────────
    private static void registerPayBotReload(CommandDispatcher<CommandSourceStack> d) {
        d.register(Commands.literal("paybotreload")
            .requires(CommandRegistry::isAdmin)
            .executes(ctx -> {
                PayBotMod mod = PayBotMod.getInstance();
                send(ctx.getSource(), "§e[PayBot] §fĐang nạp lại và áp dụng (apply) cấu hình...");
                try {
                    mod.getConfig().load();
                    send(ctx.getSource(), "§a[PayBot] §f✓ Đã nạp lại và áp dụng §a(apply) §ftoàn bộ cấu hình mới từ config.yml thành công!");
                } catch (Exception e) {
                    send(ctx.getSource(), "§c[PayBot] §fLỗi khi reload: " + e.getMessage());
                }
                return 1;
            }));
    }

}
"""
write(str(p), s)


# Preserve the downloader behavior from the uploaded 5.5.0 release. Production
# embeds every required library; this path normally exits at the class checks.
p = Path("common/src/main/java/com/naptien/compat/LibraryDownloader.java")
write(
    str(p),
    '''package com.naptien.compat;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.InputStream;
import java.lang.reflect.Method;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;

/**
 * Dynamic Library Downloader cho PayBot (Mod Common).
 * Thư viện đã được đóng gói trong bản Fabric production; cơ chế tải chỉ còn là
 * fallback cho môi trường phát triển hoặc một gói bị thiếu dependency.
 */
public class LibraryDownloader {

    private static final Logger LOGGER = LoggerFactory.getLogger("PayBot-LibDownloader");

    public static void checkAndDownloadLibraries(File configDir) {
        String[][] requiredLibs = {
            {
                "org.yaml.snakeyaml.Yaml",
                "https://repo1.maven.org/maven2/org/yaml/snakeyaml/2.2/snakeyaml-2.2.jar",
                "snakeyaml-2.2.jar"
            },
            {
                "com.google.zxing.MultiFormatWriter",
                "https://repo1.maven.org/maven2/com/google/zxing/core/3.5.3/core-3.5.3.jar",
                "core-3.5.3.jar"
            },
            {
                "com.google.zxing.client.j2se.MatrixToImageWriter",
                "https://repo1.maven.org/maven2/com/google/zxing/javase/3.5.3/javase-3.5.3.jar",
                "javase-3.5.3.jar"
            },
            {
                "fi.iki.elonen.NanoHTTPD",
                "https://repo1.maven.org/maven2/org/nanohttpd/nanohttpd/2.3.1/nanohttpd-2.3.1.jar",
                "nanohttpd-2.3.1.jar"
            }
        };

        File libsDir = new File(configDir, "libs");
        for (String[] libInfo : requiredLibs) {
            String className = libInfo[0];
            String downloadUrl = libInfo[1];
            String fileName = libInfo[2];

            if (isClassPresent(className)) continue;

            if (!libsDir.exists() && !libsDir.mkdirs() && !libsDir.isDirectory()) {
                LOGGER.warn("[PayBot] Không thể tạo thư mục dependency: {}", libsDir.getAbsolutePath());
                continue;
            }

            File targetFile = new File(libsDir, fileName);
            if (!targetFile.exists() || targetFile.length() == 0L) {
                LOGGER.info("[PayBot] Missing dependency {}, downloading from Maven Central...", fileName);
                downloadFile(downloadUrl, targetFile);
            }
            if (targetFile.isFile() && targetFile.length() > 0L) {
                injectIntoClassLoader(targetFile);
            }
        }
    }

    public static boolean isClassPresent(String className) {
        try {
            Class.forName(className, false, LibraryDownloader.class.getClassLoader());
            return true;
        } catch (ClassNotFoundException e) {
            return false;
        }
    }

    private static void downloadFile(String urlStr, File outputFile) {
        try (InputStream in = new URL(urlStr).openStream()) {
            Files.copy(in, outputFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
            LOGGER.info("[PayBot] Successfully downloaded {}", outputFile.getName());
        } catch (Exception e) {
            LOGGER.warn("[PayBot] Failed to download {}: {}", outputFile.getName(), e.getMessage());
        }
    }

    private static void injectIntoClassLoader(File jarFile) {
        try {
            ClassLoader classLoader = LibraryDownloader.class.getClassLoader();
            if (classLoader instanceof URLClassLoader urlClassLoader) {
                Method addURL = URLClassLoader.class.getDeclaredMethod("addURL", URL.class);
                addURL.setAccessible(true);
                addURL.invoke(urlClassLoader, jarFile.toURI().toURL());
            } else {
                LOGGER.info("[PayBot] ClassLoader ({}) is not URLClassLoader; relying on embedded dependencies.",
                        classLoader.getClass().getName());
            }
        } catch (Exception e) {
            LOGGER.warn("[PayBot] Could not inject {} into ClassLoader: {}", jarFile.getName(), e.getMessage());
        }
    }
}
''',
)


# Preserve custom-lore defaults introduced by the uploaded 5.5.0 release.
p = Path("common/src/main/java/com/naptien/config/PayBotConfig.java")
s = read(str(p))
s = replace_once(
    s,
    """        cfg.put("sepay-api", sepayApi);

        return cfg;""",
    """        cfg.put("sepay-api", sepayApi);

        Map<String, Object> customLore = new LinkedHashMap<>();
        customLore.put("enabled", false);
        customLore.put("bank", new LinkedHashMap<String, Object>());
        customLore.put("card", new LinkedHashMap<String, Object>());
        customLore.put("telco", new LinkedHashMap<String, Object>());
        cfg.put("custom-lore", customLore);

        return cfg;""",
    "custom-lore defaults",
)
write(str(p), s)


# Copy the 5.5.0 custom-lore template section exactly into newly generated config.
p = Path("common/src/main/resources/config-template.yml")
s = read(str(p))
marker = "# ── Custom Lore GUI (v5.4.3 / v5.4.4)"
if marker not in s:
    s = s.rstrip() + """

# ── Custom Lore GUI (v5.4.3 / v5.4.4) ──────────────────────────────────────────
# Hiển thị lore custom khi di chuột vào các icon/cục len mệnh giá nạp trong GUI.
# Mặc định: false (TẮT). Đổi thành true để BẬT lore custom.
custom-lore:
  enabled: false

  # Lore custom cho từng mệnh giá NẠP BANK (/napbank)
  # Hỗ trợ PlaceholderAPI, Hex, Gradient và các biến nội bộ của PayBot.
  bank:
    '10000':
      - "&e&lMỆNH GIÁ: &f10.000 VNĐ"
      - "&7Nạp 10k vào server qua Ngân Hàng"
      - "&aKhi nạp sẽ nhận %coin% Coins"
      - "&eClick để chọn và tạo mã VietQR!"
    '20000':
      - "&e&lMỆNH GIÁ: &f20.000 VNĐ"
      - "&7Nạp 20k vào server qua Ngân Hàng"
      - "&aKhi nạp sẽ nhận %coin% Coins"
      - "&eClick để chọn và tạo mã VietQR!"
    '50000':
      - "&e&lMỆNH GIÁ: &f50.000 VNĐ"
      - "&7Nạp 50k vào server qua Ngân Hàng"
      - "&aKhi nạp sẽ nhận %coin% Coins"
      - "&eClick để chọn và tạo mã VietQR!"
    '100000':
      - "&#FF8C00&lMỆNH GIÁ VIP: &#FFD700100.000 VNĐ"
      - "&7Nạp 100k vào server qua Ngân Hàng"
      - "&aKhi nạp sẽ nhận %coin% Coins"
      - "&eClick để chọn và tạo mã VietQR!"
    '200000':
      - "&#FF8C00&lMỆNH GIÁ VIP: &#FFD700200.000 VNĐ"
      - "&7Nạp 200k vào server qua Ngân Hàng"
      - "&aKhi nạp sẽ nhận %coin% Coins"
      - "&eClick để chọn và tạo mã VietQR!"
    '500000':
      - "<gradient:#FF007F:#7F00FF>&lMỆNH GIÁ SIÊU CẤP: 500.000 VNĐ</gradient>"
      - "&7Nạp 500k vào server qua Ngân Hàng"
      - "&aKhi nạp sẽ nhận %coin% Coins"
      - "&eClick để chọn và tạo mã VietQR!"
    '1000000':
      - "<gradient:#FFD700:#FF4500>&lMỆNH GIÁ THẦN THOẠI: 1.000.000 VNĐ</gradient>"
      - "&7Nạp 1M vào server qua Ngân Hàng"
      - "&aKhi nạp sẽ nhận %coin% Coins"
      - "&eClick để chọn và tạo mã VietQR!"

  # Lore custom cho từng mệnh giá NẠP THẺ (/napthe)
  card:
    '10000':
      - "&e&lMỆNH GIÁ: &f10.000 VNĐ"
      - "&7Nạp 10k vào server bằng thẻ cào"
      - "&aKhi nạp sẽ nhận %coin% Coins"
      - "&eClick để chọn mệnh giá này!"
    '20000':
      - "&e&lMỆNH GIÁ: &f20.000 VNĐ"
      - "&7Nạp 20k vào server bằng thẻ cào"
      - "&aKhi nạp sẽ nhận %coin% Coins"
      - "&eClick để chọn mệnh giá này!"
    '30000':
      - "&e&lMỆNH GIÁ: &f30.000 VNĐ"
      - "&7Nạp 30k vào server bằng thẻ cào"
      - "&aKhi nạp sẽ nhận %coin% Coins"
      - "&eClick để chọn mệnh giá này!"
    '50000':
      - "&e&lMỆNH GIÁ: &f50.000 VNĐ"
      - "&7Nạp 50k vào server bằng thẻ cào"
      - "&aKhi nạp sẽ nhận %coin% Coins"
      - "&eClick để chọn mệnh giá này!"
    '100000':
      - "&#FF8C00&lMỆNH GIÁ: &#FFD700100.000 VNĐ"
      - "&7Nạp 100k vào server bằng thẻ cào"
      - "&aKhi nạp sẽ nhận %coin% Coins"
      - "&eClick để chọn mệnh giá này!"
    '200000':
      - "&#FF8C00&lMỆNH GIÁ: &#FFD700200.000 VNĐ"
      - "&7Nạp 200k vào server bằng thẻ cào"
      - "&aKhi nạp sẽ nhận %coin% Coins"
      - "&eClick để chọn mệnh giá này!"
    '300000':
      - "&#FF8C00&lMỆNH GIÁ: &#FFD700300.000 VNĐ"
      - "&7Nạp 300k vào server bằng thẻ cào"
      - "&aKhi nạp sẽ nhận %coin% Coins"
      - "&eClick để chọn mệnh giá này!"
    '500000':
      - "<gradient:#FF007F:#7F00FF>&lMỆNH GIÁ SIÊU CẤP: 500.000 VNĐ</gradient>"
      - "&7Nạp 500k vào server bằng thẻ cào"
      - "&aKhi nạp sẽ nhận %coin% Coins"
      - "&eClick để chọn mệnh giá này!"
    '1000000':
      - "<gradient:#FFD700:#FF4500>&lMỆNH GIÁ THẦN THOẠI: 1.000.000 VNĐ</gradient>"
      - "&7Nạp 1M vào server bằng thẻ cào"
      - "&aKhi nạp sẽ nhận %coin% Coins"
      - "&eClick để chọn mệnh giá này!"

  # Lore custom cho các icon nhà mạng trong /napthe
  telco:
    'Viettel':
      - "&c&lNHÀ MẠNG VIETTEL"
      - "&aMệnh giá: &f10k - 1000k"
      - "&eClick để chọn nhà mạng Viettel!"
    'Vinaphone':
      - "&9&lNHÀ MẠNG VINAPHONE"
      - "&aMệnh giá: &f10k - 500k"
      - "&eClick để chọn nhà mạng Vinaphone!"
    'Mobifone':
      - "&a&lNHÀ MẠNG MOBIFONE"
      - "&aMệnh giá: &f10k - 500k"
      - "&eClick để chọn nhà mạng Mobifone!"
    'Zing':
      - "&e&lTHẺ ZING"
      - "&aMệnh giá: &f10k - 1000k"
      - "&eClick để chọn thẻ Zing!"
    'Gate':
      - "&b&lTHẺ GATE"
      - "&aMệnh giá: &f10k - 500k"
      - "&eClick để chọn thẻ Gate!"
    'Garena':
      - "&6&lTHẺ GARENA"
      - "&aMệnh giá: &f20k - 500k"
      - "&eClick để chọn thẻ Garena!"
    'Vcoin':
      - "&5&lTHẺ VCOIN"
      - "&aMệnh giá: &f10k - 1000k"
      - "&eClick để chọn thẻ Vcoin!"
    'Appota':
      - "&d&lTHẺ APPOTA"
      - "&aMệnh giá: &f10k - 500k"
      - "&eClick để chọn thẻ Appota!"
    'Vietnamobile':
      - "&3&lNHÀ MẠNG VIETNAMOBILE"
      - "&aMệnh giá: &f10k - 500k"
      - "&eClick để chọn nhà mạng Vietnamobile!"
""" + "\n"
write(str(p), s)


# Preserve the uploaded release's fallback version if Architectury metadata is
# temporarily unavailable.
p = Path("common/src/main/java/com/naptien/PayBotMod.java")
s = read(str(p))
s = s.replace(' : "5.4.2";', ' : "5.5.0-mc1.21.1-fullpatch";')
s = s.replace('return "5.4.2";', 'return "5.5.0-mc1.21.1-fullpatch";')
if "5.4.2" in s:
    raise SystemExit("PayBotMod fallback version still contains 5.4.2")
write(str(p), s)

print("Merged uploaded PayBot 5.5.0 feature delta")
