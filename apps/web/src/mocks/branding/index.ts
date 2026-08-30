import type {BrandingConfig,SocialChannel} from '../../shared/data/contracts'
import {portalLogo} from '../../shared/branding/assets/brandAsset'

export const mockBrandingConfig:BrandingConfig={headerImage:portalLogo,headerImageAlt:'Portal Lander',footerImage:portalLogo,footerImageAlt:'Portal Lander'}
export const mockSocialChannels:SocialChannel[]=[
 {id:'social_instagram',network:'instagram',label:'Instagram',url:'https://instagram.com/portallander',active:true,order:1},
 {id:'social_tiktok',network:'tiktok',label:'TikTok',url:'https://tiktok.com/@portallander',active:true,order:2},
 {id:'social_youtube',network:'youtube',label:'YouTube',url:'https://youtube.com/@portallander',active:true,order:3},
 {id:'social_x',network:'x',label:'X',url:'https://x.com/portallander',active:true,order:4},
 {id:'social_spotify',network:'spotify',label:'Spotify',url:'https://open.spotify.com/',active:false,order:5},
]
