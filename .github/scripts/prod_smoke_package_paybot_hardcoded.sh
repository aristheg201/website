#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
WORK="$ROOT/paybot-hardcoded-build"
OUT="$ROOT/out-hardcoded"
FORGE_VERSION="1.21.1-52.1.16"
NEOFORGE_VERSION="21.1.244"

FORGE_JAR="$(find "$WORK/forge/build/libs" -maxdepth 1 -type f -name '*.jar' ! -name '*-dev.jar' ! -name '*-dev-shadow.jar' | head -n 1)"
NEOFORGE_JAR="$(find "$WORK/neoforge/build/libs" -maxdepth 1 -type f -name '*.jar' ! -name '*-dev.jar' ! -name '*-dev-shadow.jar' | head -n 1)"
test -n "$FORGE_JAR"
test -n "$NEOFORGE_JAR"

install_server() {
  local loader="$1"
  local version="$2"
  local url="$3"
  local dir="$4"
  rm -rf "$dir"
  mkdir -p "$dir"
  curl -fL --retry 3 -o "$dir/installer.jar" "$url"
  (
    cd "$dir"
    java -Xmx2G -jar installer.jar --installServer
  )
  test -f "$dir/run.sh"
}

run_server() {
  local loader="$1"
  local dir="$2"
  local mod="$3"
  local port="$4"
  local log="$5"
  local input="$6"
  local ok="$7"

  mkdir -p "$dir/mods"
  cp "$mod" "$dir/mods/"
  printf 'eula=true\n' > "$dir/eula.txt"
  cat > "$dir/user_jvm_args.txt" <<'EOF'
-Xms512M
-Xmx2G
-Dfile.encoding=UTF-8
EOF
  cat > "$dir/server.properties" <<EOF
online-mode=false
enforce-secure-profile=false
server-port=$port
view-distance=2
simulation-distance=2
generate-structures=false
level-type=minecraft:flat
motd=PayBot $loader production smoke test
EOF

  rm -f "$input" "$log" "$ok"
  mkfifo "$input"
  exec 3<>"$input"
  (
    cd "$dir"
    bash run.sh nogui
  ) < "$input" > "$log" 2>&1 &
  local pid=$!

  for _ in $(seq 1 480); do
    if grep -q 'Kết nối SQLite thành công' "$log" && grep -q 'Done (' "$log"; then
      touch "$ok"
      sleep 8
      printf 'stop\n' >&3
      break
    fi
    if ! kill -0 "$pid" 2>/dev/null; then break; fi
    sleep 1
  done
  for _ in $(seq 1 120); do
    if ! kill -0 "$pid" 2>/dev/null; then break; fi
    sleep 1
  done
  if kill -0 "$pid" 2>/dev/null; then kill "$pid" || true; fi
  wait "$pid" || true
  exec 3>&-

  tail -n 400 "$log"
  test -f "$ok"
  grep -q 'Kết nối SQLite thành công' "$log"
  grep -q 'Done (' "$log"
  ! grep -Eq 'NoSuchMethodError|NoClassDefFoundError|ClassNotFoundException|ModLoadingException|Failed to load mod|Exception in server tick loop' "$log"
}

FORGE_SERVER="$WORK/forge-production-server"
NEOFORGE_SERVER="$WORK/neoforge-production-server"
install_server Forge "$FORGE_VERSION" "https://maven.minecraftforge.net/net/minecraftforge/forge/$FORGE_VERSION/forge-$FORGE_VERSION-installer.jar" "$FORGE_SERVER"
run_server Forge "$FORGE_SERVER" "$FORGE_JAR" 25575 "$WORK/forge-production-smoke.log" "$WORK/forge-production-input" "$WORK/forge-production-ok"

install_server NeoForge "$NEOFORGE_VERSION" "https://maven.neoforged.net/releases/net/neoforged/neoforge/$NEOFORGE_VERSION/neoforge-$NEOFORGE_VERSION-installer.jar" "$NEOFORGE_SERVER"
run_server NeoForge "$NEOFORGE_SERVER" "$NEOFORGE_JAR" 25576 "$WORK/neoforge-production-smoke.log" "$WORK/neoforge-production-input" "$WORK/neoforge-production-ok"

rm -rf "$OUT"
mkdir -p "$OUT/forge-panel/mods" "$OUT/neoforge-panel/mods"
cp "$FORGE_JAR" "$OUT/PayBot-Mod-Forge-5.5.0-MC1.21.1-HARDCODED-FIX.jar"
cp "$NEOFORGE_JAR" "$OUT/PayBot-Mod-NeoForge-5.5.0-MC1.21.1-HARDCODED-FIX.jar"
cp "$FORGE_JAR" "$OUT/forge-panel/mods/PayBot-Mod-Forge-5.5.0-MC1.21.1-HARDCODED-FIX.jar"
cp "$NEOFORGE_JAR" "$OUT/neoforge-panel/mods/PayBot-Mod-NeoForge-5.5.0-MC1.21.1-HARDCODED-FIX.jar"

cat > "$OUT/forge-panel/CAI_DAT.txt" <<'EOF'
Minecraft 1.21.1, Forge 52.1.x, Java 21.
Chi cai JAR Forge, khong cai dong thoi JAR NeoForge.
Khong can Architectury API.
Ban nay giu nguyen toan bo message, GUI va menh gia hardcode cu; chi sua loi tuong thich va dependency.
EOF
cat > "$OUT/neoforge-panel/CAI_DAT.txt" <<'EOF'
Minecraft 1.21.1, NeoForge 21.1.x, Java 21.
Chi cai JAR NeoForge, khong cai dong thoi JAR Forge.
Khong can Architectury API.
Ban nay giu nguyen toan bo message, GUI va menh gia hardcode cu; chi sua loi tuong thich va dependency.
EOF

tar -czf "$OUT/PayBot-Forge-5.5.0-MC1.21.1-HARDCODED-FIX-PANEL.tar.gz" -C "$OUT/forge-panel" .
tar -czf "$OUT/PayBot-NeoForge-5.5.0-MC1.21.1-HARDCODED-FIX-PANEL.tar.gz" -C "$OUT/neoforge-panel" .
tar -czf "$OUT/PayBot-5.5.0-MC1.21.1-HARDCODED-FIX-SOURCE.tar.gz" -C "$WORK" common forge neoforge build.gradle settings.gradle gradle.properties
cp "$WORK/forge-production-smoke.log" "$OUT/forge-production-smoke.log"
cp "$WORK/neoforge-production-smoke.log" "$OUT/neoforge-production-smoke.log"

cat > "$OUT/VALIDATION.txt" <<'EOF'
Forge and NeoForge are separate production JARs.
Minecraft API was ported to Minecraft 1.21.1 data components.
Original hardcoded messages, GUI text and fixed denomination array were preserved.
No messages.yml and no dynamic denomination configuration are included.
Native Forge and NeoForge lifecycle, command, player join/quit and chat hooks are used.
No Architectury runtime dependency is required.
NanoHTTPD, ZXing, SnakeYAML, SQLite, MySQL and HikariCP are embedded.
Both clean production dedicated servers reached Done, connected SQLite and shut down without PayBot class or method errors.
EOF

cd "$OUT"
find . -maxdepth 1 -type f \( -name '*.jar' -o -name '*.tar.gz' \) -print0 | sort -z | xargs -0 sha256sum > SHA256.txt
