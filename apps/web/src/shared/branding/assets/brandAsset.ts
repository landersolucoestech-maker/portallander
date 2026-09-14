const encodeSvg=(svg:string)=>`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`

const wordmarkSvg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 180" role="img" aria-label="Portal Lander"><text x="0" y="128" fill="#ffffff" font-family="Arial Narrow,Arial,sans-serif" font-size="112" font-weight="700" letter-spacing="4">PORTAL LANDER</text></svg>`
const avatarSvg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Portal Lander"><circle cx="64" cy="64" r="64" fill="#e30613"/><circle cx="64" cy="64" r="54" fill="none" stroke="#ffffff" stroke-width="4" opacity=".96"/><text x="64" y="77" text-anchor="middle" fill="#ffffff" font-family="Arial,Helvetica,sans-serif" font-size="43" font-weight="800" letter-spacing="-2">PL</text></svg>`

export const portalLogo=encodeSvg(wordmarkSvg)
export const portalAvatarMark=encodeSvg(avatarSvg)
