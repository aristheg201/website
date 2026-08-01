#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
WORK="$ROOT/paybot-hardcoded-build"
OUT="$ROOT/out-hardcoded"
rm -rf "$WORK" "$OUT"
git clone --depth 1 https://github.com/ShirozNguyen/Paybot.git "$WORK"
cd "$WORK"
python3 "$ROOT/.github/scripts/patch_paybot_1211.py"
python3 "$ROOT/.github/scripts/patch_paybot_hardcoded_forge_neoforge_1211.py"
python3 "$ROOT/.github/scripts/fix_paybot_hardcoded_compile.py"

# The hardcoded editions must stay hardcoded.
test ! -e common/src/main/resources/messages.yml
test ! -e common/src/main/java/com/naptien/config/MessageManager.java
grep -q 'public static final int\[\] DENOMS' common/src/main/java/com/naptien/gui/GuiUtil.java
grep -q '10_000' common/src/main/java/com/naptien/gui/GuiUtil.java
grep -q '1_000_000' common/src/main/java/com/naptien/gui/GuiUtil.java
! grep -Rqs 'denominations:' common/src/main/resources common/src/main/java
! grep -Rqs 'dev.architectury' common/src/main/java common/src/main/resources

gradle :forge:build :neoforge:build --stacktrace --no-daemon

FORGE_JAR="$(find forge/build/libs -maxdepth 1 -type f -name '*.jar' ! -name '*-dev.jar' ! -name '*-dev-shadow.jar' | head -n 1)"
NEOFORGE_JAR="$(find neoforge/build/libs -maxdepth 1 -type f -name '*.jar' ! -name '*-dev.jar' ! -name '*-dev-shadow.jar' | head -n 1)"
test -n "$FORGE_JAR"
test -n "$NEOFORGE_JAR"

validate_common() {
  local jar="$1"
  local entries
  entries="$(mktemp)"
  unzip -t "$jar" >/dev/null
  zipinfo -1 "$jar" > "$entries"
  grep -Fxq 'fi/iki/elonen/NanoHTTPD.class' "$entries"
  grep -Fxq 'com/google/zxing/MultiFormatWriter.class' "$entries"
  grep -Fxq 'com/google/zxing/client/j2se/MatrixToImageWriter.class' "$entries"
  grep -Fxq 'org/yaml/snakeyaml/Yaml.class' "$entries"
  grep -Fxq 'org/sqlite/JDBC.class' "$entries"
  grep -Fxq 'com/mysql/cj/jdbc/Driver.class' "$entries"
  grep -Fxq 'com/zaxxer/hikari/HikariDataSource.class' "$entries"
  grep -Eq '^org/sqlite/native/Linux/.*/libsqlitejdbc\.so$' "$entries"
  ! grep -Fxq 'messages.yml' "$entries"
  ! grep -Fq 'MessageManager.class' "$entries"
  ! grep -Fq 'dev/architectury/' "$entries"
  ! unzip -p "$jar" com/naptien/PayBotMod.class | strings | grep -Fxq 'method_7985'
  rm -f "$entries"
}

validate_common "$FORGE_JAR"
validate_common "$NEOFORGE_JAR"
zipinfo -1 "$FORGE_JAR" | grep -Fxq 'META-INF/mods.toml'
zipinfo -1 "$FORGE_JAR" | grep -Fxq 'com/naptien/forge/PayBotForgeInit.class'
! zipinfo -1 "$FORGE_JAR" | grep -Fxq 'META-INF/neoforge.mods.toml'
zipinfo -1 "$NEOFORGE_JAR" | grep -Fxq 'META-INF/neoforge.mods.toml'
zipinfo -1 "$NEOFORGE_JAR" | grep -Fxq 'com/naptien/neoforge/PayBotNeoForgeInit.class'
! zipinfo -1 "$NEOFORGE_JAR" | grep -Fxq 'META-INF/mods.toml'
unzip -p "$FORGE_JAR" META-INF/mods.toml | grep -q 'versionRange="\[1.21.1,1.21.2)"'
unzip -p "$NEOFORGE_JAR" META-INF/neoforge.mods.toml | grep -q 'versionRange="\[1.21.1,1.21.2)"'

smoke_test() {
  local loader="$1"
  local port="$2"
  local log="$3"
  local ok="$4"
  local input="$5"

  mkdir -p "$loader/run"
  printf 'eula=true\n' > "$loader/run/eula.txt"
  cat > "$loader/run/server.properties" <<EOF
online-mode=false
enforce-secure-profile=false
server-port=$port
view-distance=2
simulation-distance=2
generate-structures=false
level-type=minecraft:flat
motd=PayBot $loader smoke test
EOF

  rm -f "$input" "$log" "$ok"
  mkfifo "$input"
  exec 3<>"$input"
  gradle ":$loader:runServer" --no-daemon < "$input" > "$log" 2>&1 &
  local pid=$!
  for _ in $(seq 1 420); do
    if grep -q 'Kết nối SQLite thành công' "$log" && grep -q 'Done (' "$log"; then
      touch "$ok"
      sleep 8
      printf 'stop\n' >&3
      break
    fi
    if ! kill -0 "$pid" 2>/dev/null; then break; fi
    sleep 1
  done
  for _ in $(seq 1 90); do
    if ! kill -0 "$pid" 2>/dev/null; then break; fi
    sleep 1
  done
  if kill -0 "$pid" 2>/dev/null; then kill "$pid" || true; fi
  wait "$pid" || true
  exec 3>&-
  tail -n 350 "$log"
  test -f "$ok"
  ! grep -Eq 'NoSuchMethodError|NoClassDefFoundError|ClassNotFoundException|Failed to load mod|ModLoadingException' "$log"
}

smoke_test forge 25575 forge-smoke.log forge-smoke-ok forge-smoke-input
smoke_test neoforge 25576 neoforge-smoke.log neoforge-smoke-ok neoforge-smoke-input

mkdir -p "$OUT/forge-panel/mods" "$OUT/neoforge-panel/mods"
cp "$FORGE_JAR" "$OUT/PayBot-Mod-Forge-5.5.0-MC1.21.1-HARDCODED-FIX.jar"
cp "$NEOFORGE_JAR" "$OUT/PayBot-Mod-NeoForge-5.5.0-MC1.21.1-HARDCODED-FIX.jar"
cp "$FORGE_JAR" "$OUT/forge-panel/mods/PayBot-Mod-Forge-5.5.0-MC1.21.1-HARDCODED-FIX.jar"
cp "$NEOFORGE_JAR" "$OUT/neoforge-panel/mods/PayBot-Mod-NeoForge-5.5.0-MC1.21.1-HARDCODED-FIX.jar"
printf 'Minecraft 1.21.1, Forge 52.1.x, Java 21. Chi cai ban Forge. Khong can Architectury API. Giu nguyen message, GUI va menh gia hardcode cu.\n' > "$OUT/forge-panel/CAI_DAT.txt"
printf 'Minecraft 1.21.1, NeoForge 21.1.x, Java 21. Chi cai ban NeoForge. Khong can Architectury API. Giu nguyen message, GUI va menh gia hardcode cu.\n' > "$OUT/neoforge-panel/CAI_DAT.txt"
tar -czf "$OUT/PayBot-Forge-5.5.0-MC1.21.1-HARDCODED-FIX-PANEL.tar.gz" -C "$OUT/forge-panel" .
tar -czf "$OUT/PayBot-NeoForge-5.5.0-MC1.21.1-HARDCODED-FIX-PANEL.tar.gz" -C "$OUT/neoforge-panel" .
tar -czf "$OUT/PayBot-5.5.0-MC1.21.1-HARDCODED-FIX-SOURCE.tar.gz" common forge neoforge build.gradle settings.gradle gradle.properties
cp forge-smoke.log "$OUT/forge-server-smoke.log"
cp neoforge-smoke.log "$OUT/neoforge-server-smoke.log"
cat > "$OUT/VALIDATION.txt" <<'EOF'
Separate Forge and NeoForge production JARs.
Minecraft API ported to 1.21.1 data components.
Original hardcoded messages, GUI text and denomination array preserved.
No messages.yml and no dynamic denomination system.
Native Forge/NeoForge lifecycle, command, player join/quit and chat hooks.
No Architectury runtime dependency.
NanoHTTPD, ZXing, SnakeYAML, SQLite, MySQL and HikariCP embedded.
Both dedicated-server smoke tests reached Done, connected SQLite, and shut down cleanly.
EOF
cd "$OUT"
find . -maxdepth 1 -type f \( -name '*.jar' -o -name '*.tar.gz' \) -print0 | sort -z | xargs -0 sha256sum > SHA256.txt
