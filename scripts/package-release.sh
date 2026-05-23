#!/usr/bin/env bash
# =====================================================================
# Opticks Audio — Plug-in release packager
# =====================================================================
# Builds the .zip archives that the website's download endpoint expects.
#
# What it does:
#   1. Locates each .vst3 in ~/Library/Audio/Plug-Ins/VST3/
#   2. Locates the matching .component (AU) in
#      ~/Library/Audio/Plug-Ins/Components/ when available
#   3. Bundles them into a single per-plug-in .zip alongside a README
#   4. Drops the archives in ~/Downloads/opticks-releases/v<version>/
#
# Naming convention (matches src/lib/r2.ts pluginObjectKey):
#   Reflexion-mac-v<version>.zip
#   Refraction-mac-v<version>.zip
#   Inflexion-mac-v<version>.zip
#
# Usage:
#   ./scripts/package-release.sh 0.1.0
# =====================================================================

set -euo pipefail

VERSION="${1:-0.1.0}"
OUT_DIR="${HOME}/Downloads/opticks-releases/v${VERSION}"
VST3_DIR="${HOME}/Library/Audio/Plug-Ins/VST3"
AU_DIR="${HOME}/Library/Audio/Plug-Ins/Components"

PLUGINS=("Reflexion" "Refraction" "Inflexion")

mkdir -p "${OUT_DIR}"

echo "==> Packaging Opticks Audio v${VERSION}"
echo "    output: ${OUT_DIR}"
echo ""

for name in "${PLUGINS[@]}"; do
  vst3_path="${VST3_DIR}/${name}.vst3"
  au_path="${AU_DIR}/${name}.component"
  zip_name="${name}-mac-v${VERSION}.zip"
  zip_path="${OUT_DIR}/${zip_name}"

  if [[ ! -d "${vst3_path}" ]]; then
    echo "  [!] ${name}.vst3 not found at ${vst3_path} — skipping."
    continue
  fi

  staging="$(mktemp -d -t opticks_release_XXXXXX)"
  trap 'rm -rf "${staging}"' RETURN

  # Copy the VST3 bundle (it's a directory on macOS).
  cp -R "${vst3_path}" "${staging}/${name}.vst3"

  if [[ -d "${au_path}" ]]; then
    cp -R "${au_path}" "${staging}/${name}.component"
    has_au=1
  else
    has_au=0
  fi

  # README.txt — installation instructions inside the archive.
  cat > "${staging}/README.txt" <<README
${name} v${VERSION}
Opticks Audio — opticksaudio.com

INSTALLATION (macOS)

1. Quit your DAW.
2. Copy ${name}.vst3 into:
     /Library/Audio/Plug-Ins/VST3/
$( [[ ${has_au} -eq 1 ]] && printf '3. Copy %s.component into:\n     /Library/Audio/Plug-Ins/Components/\n' "${name}" )
   (Admin password may be requested.)

3. Right-click each file and choose "Open" the first time so macOS
   Gatekeeper trusts the build (beta releases are not yet code-signed).

4. Launch your DAW. ${name} will appear under Opticks Audio.

SUPPORT
beta@opticksaudio.com
README

  # Build the zip from inside the staging dir so paths are clean.
  (cd "${staging}" && zip -qr "${zip_path}" .)
  size=$(du -h "${zip_path}" | awk '{print $1}')
  echo "  [✓] ${zip_name}  (${size})  $( [[ ${has_au} -eq 1 ]] && echo "VST3 + AU" || echo "VST3 only")"

  rm -rf "${staging}"
  trap - RETURN
done

echo ""
echo "==> Done. Upload these to your R2 bucket using this layout:"
echo ""
for name in "${PLUGINS[@]}"; do
  slug=$(echo "${name}" | tr '[:upper:]' '[:lower:]')
  echo "    opticks-audio-releases/${slug}/v${VERSION}/${name}-mac-v${VERSION}.zip"
done
