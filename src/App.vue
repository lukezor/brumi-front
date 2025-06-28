<script setup>
import { ref } from 'vue'
import InstagramEmbed from './components/InstagramEmbed.vue'

const productWindow = ref(0)

const products = [
  {
    id: 1,
    title: 'Cesta Especial',
    description: 'Uma seleção especial de produtos para presentear quem você ama.',
    price: '199,90',
    image: 'https://picsum.photos/400/300?random=1'
  },
  {
    id: 2,
    title: 'Kit Perfumado',
    description: 'Kit com produtos perfumados para todos os gostos.',
    price: '159,90',
    image: 'https://picsum.photos/400/300?random=2'
  },
  {
    id: 3,
    title: 'Cesta Premium',
    description: 'Produtos selecionados com o melhor custo-benefício.',
    price: '249,90',
    image: 'https://picsum.photos/400/300?random=3'
  },
  {
    id: 4,
    title: 'Kit Presente',
    description: 'Presente especial para ocasiões especiais.',
    price: '179,90',
    image: 'https://picsum.photos/400/300?random=4'
  },
  {
    id: 5,
    title: 'Cesta Luxo',
    description: 'Produtos de alta qualidade para quem merece o melhor.',
    price: '299,90',
    image: 'https://picsum.photos/400/300?random=5'
  },
  {
    id: 6,
    title: 'Kit Personalizado',
    description: 'Monte seu kit com os produtos que preferir.',
    price: '219,90',
    image: 'https://picsum.photos/400/300?random=6'
  },
  {
    id: 7,
    title: 'Cesta Gourmet',
    description: 'Produtos gourmet para os amantes da boa culinária.',
    price: '189,90',
    image: 'https://picsum.photos/400/300?random=7'
  },
  {
    id: 8,
    title: 'Kit Spa',
    description: 'Produtos para relaxamento e cuidados pessoais.',
    price: '169,90',
    image: 'https://picsum.photos/400/300?random=8'
  },
  {
    id: 9,
    title: 'Cesta Festa',
    description: 'Produtos para celebrar momentos especiais.',
    price: '229,90',
    image: 'https://picsum.photos/400/300?random=9'
  }
]

const productGroups = [
  products.slice(0, 3),
  products.slice(3, 6),
  products.slice(6, 9)
]

const instagramPosts = ref([
  {
    embedCode: `<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="https://www.instagram.com/reel/DKqZGZyIgKP/?utm_source=ig_embed&amp;utm_campaign=loading" data-instgrm-version="14" style=" background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);"><div style="padding:16px;"> <a href="https://www.instagram.com/reel/DKqZGZyIgKP/?utm_source=ig_embed&amp;utm_campaign=loading" style=" background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;" target="_blank"> <div style=" display: flex; flex-direction: row; align-items: center;"> <div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 40px; margin-right: 14px; width: 40px;"></div> <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center;"> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 100px;"></div> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 60px;"></div></div></div><div style="padding: 19% 0;"></div> <div style="display:block; height:50px; margin:0 auto 12px; width:50px;"><svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="https://www.w3.org/2000/svg" xmlns:xlink="https://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-511.000000, -20.000000)" fill="#000000"><g><path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631"></path></g></g></g></svg></div><div style="padding-top: 8px;"> <div style=" color:#3897f0; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:550; line-height:18px;">View this post on Instagram</div></div><div style="padding: 12.5% 0;"></div> <div style="display: flex; flex-direction: row; margin-bottom: 14px; align-items: center;"><div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(0px) translateY(7px);"></div> <div style="background-color: #F4F4F4; height: 12.5px; transform: rotate(-45deg) translateX(3px) translateY(1px); width: 12.5px; flex-grow: 0; margin-right: 14px; margin-left: 2px;"></div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(9px) translateY(-18px);"></div></div><div style="margin-left: 8px;"> <div style=" background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 20px; width: 20px;"></div> <div style=" width: 0; height: 0; border-top: 2px solid transparent; border-left: 6px solid #f4f4f4; border-bottom: 2px solid transparent; transform: translateX(16px) translateY(-4px) rotate(30deg)"></div></div><div style="margin-left: auto;"> <div style=" width: 0px; border-top: 8px solid #F4F4F4; border-right: 8px solid transparent; transform: translateY(16px);"></div> <div style=" background-color: #F4F4F4; flex-grow: 0; height: 12px; width: 16px; transform: translateY(-4px);"></div> <div style=" width: 0; height: 0; border-top: 8px solid #F4F4F4; border-left: 8px solid transparent; transform: translateY(-4px) translateX(8px);"></div></div></div> <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center; margin-bottom: 24px;"> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 224px;"></div> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 144px;"></div></div></a><p style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; line-height:17px; margin-bottom:0; margin-top:8px; overflow:hidden; padding:8px 0 7px; text-align:center; text-overflow:ellipsis; white-space:nowrap;"><a href="https://www.instagram.com/reel/DKqZGZyIgKP/?utm_source=ig_embed&amp;utm_campaign=loading" style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:normal; line-height:17px; text-decoration:none;" target="_blank">A post shared by BRUMIPRESENTES PERFUMADOS (@brumipresentes)</a></p></div></blockquote>`
  },
  {
    embedCode: `<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="https://www.instagram.com/p/DKqS6d-PzYy/?utm_source=ig_embed&amp;utm_campaign=loading" data-instgrm-version="14" style=" background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);"><div style="padding:16px;"> <a href="https://www.instagram.com/p/DKqS6d-PzYy/?utm_source=ig_embed&amp;utm_campaign=loading" style=" background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;" target="_blank"> <div style=" display: flex; flex-direction: row; align-items: center;"> <div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 40px; margin-right: 14px; width: 40px;"></div> <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center;"> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 100px;"></div> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 60px;"></div></div></div><div style="padding: 19% 0;"></div> <div style="display:block; height:50px; margin:0 auto 12px; width:50px;"><svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="https://www.w3.org/2000/svg" xmlns:xlink="https://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-511.000000, -20.000000)" fill="#000000"><g><path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631"></path></g></g></g></svg></div><div style="padding-top: 8px;"> <div style=" color:#3897f0; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:550; line-height:18px;">View this post on Instagram</div></div><div style="padding: 12.5% 0;"></div> <div style="display: flex; flex-direction: row; margin-bottom: 14px; align-items: center;"><div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(0px) translateY(7px);"></div> <div style="background-color: #F4F4F4; height: 12.5px; transform: rotate(-45deg) translateX(3px) translateY(1px); width: 12.5px; flex-grow: 0; margin-right: 14px; margin-left: 2px;"></div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(9px) translateY(-18px);"></div></div><div style="margin-left: 8px;"> <div style=" background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 20px; width: 20px;"></div> <div style=" width: 0; height: 0; border-top: 2px solid transparent; border-left: 6px solid #f4f4f4; border-bottom: 2px solid transparent; transform: translateX(16px) translateY(-4px) rotate(30deg)"></div></div><div style="margin-left: auto;"> <div style=" width: 0px; border-top: 8px solid #F4F4F4; border-right: 8px solid transparent; transform: translateY(16px);"></div> <div style=" background-color: #F4F4F4; flex-grow: 0; height: 12px; width: 16px; transform: translateY(-4px);"></div> <div style=" width: 0; height: 0; border-top: 8px solid #F4F4F4; border-left: 8px solid transparent; transform: translateY(-4px) translateX(8px);"></div></div></div> <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center; margin-bottom: 24px;"> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 224px;"></div> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 144px;"></div></div></a><p style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; line-height:17px; margin-bottom:0; margin-top:8px; overflow:hidden; padding:8px 0 7px; text-align:center; text-overflow:ellipsis; white-space:nowrap;"><a href="https://www.instagram.com/p/DKqS6d-PzYy/?utm_source=ig_embed&amp;utm_campaign=loading" style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:normal; line-height:17px; text-decoration:none;" target="_blank">A post shared by BRUMIPRESENTES PERFUMADOS (@brumipresentes)</a></p></div></blockquote>`
  },
  {
    embedCode: `<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="https://www.instagram.com/p/DKk9Iv7PoOO/?utm_source=ig_embed&amp;utm_campaign=loading" data-instgrm-version="14" style=" background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);"><div style="padding:16px;"> <a href="https://www.instagram.com/p/DKk9Iv7PoOO/?utm_source=ig_embed&amp;utm_campaign=loading" style=" background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;" target="_blank"> <div style=" display: flex; flex-direction: row; align-items: center;"> <div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 40px; margin-right: 14px; width: 40px;"></div> <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center;"> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 100px;"></div> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 60px;"></div></div></div><div style="padding: 19% 0;"></div> <div style="display:block; height:50px; margin:0 auto 12px; width:50px;"><svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="https://www.w3.org/2000/svg" xmlns:xlink="https://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-511.000000, -20.000000)" fill="#000000"><g><path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631"></path></g></g></g></svg></div><div style="padding-top: 8px;"> <div style=" color:#3897f0; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:550; line-height:18px;">View this post on Instagram</div></div><div style="padding: 12.5% 0;"></div> <div style="display: flex; flex-direction: row; margin-bottom: 14px; align-items: center;"><div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(0px) translateY(7px);"></div> <div style="background-color: #F4F4F4; height: 12.5px; transform: rotate(-45deg) translateX(3px) translateY(1px); width: 12.5px; flex-grow: 0; margin-right: 14px; margin-left: 2px;"></div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(9px) translateY(-18px);"></div></div><div style="margin-left: 8px;"> <div style=" background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 20px; width: 20px;"></div> <div style=" width: 0; height: 0; border-top: 2px solid transparent; border-left: 6px solid #f4f4f4; border-bottom: 2px solid transparent; transform: translateX(16px) translateY(-4px) rotate(30deg)"></div></div><div style="margin-left: auto;"> <div style=" width: 0px; border-top: 8px solid #F4F4F4; border-right: 8px solid transparent; transform: translateY(16px);"></div> <div style=" background-color: #F4F4F4; flex-grow: 0; height: 12px; width: 16px; transform: translateY(-4px);"></div> <div style=" width: 0; height: 0; border-top: 8px solid #F4F4F4; border-left: 8px solid transparent; transform: translateY(-4px) translateX(8px);"></div></div></div> <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center; margin-bottom: 24px;"> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 224px;"></div> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 144px;"></div></div></a><p style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; line-height:17px; margin-bottom:0; margin-top:8px; overflow:hidden; padding:8px 0 7px; text-align:center; text-overflow:ellipsis; white-space:nowrap;"><a href="https://www.instagram.com/p/DKk9Iv7PoOO/?utm_source=ig_embed&amp;utm_campaign=loading" style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:normal; line-height:17px; text-decoration:none;" target="_blank">A post shared by BRUMIPRESENTES PERFUMADOS (@brumipresentes)</a></p></div></blockquote>`
  }
])

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

const scrollToBottom = () => {
  window.scrollTo({
    top: document.documentElement.scrollHeight,
    behavior: 'smooth'
  })
}

const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

const openInstagram = () => {
  window.open('https://www.instagram.com/brumipresentes/', '_blank')
}
</script>

<template>
  <v-app>
    <v-app-bar color="primary" elevation="0" class="nav-bar">
      <v-container class="d-flex align-center">
        <div class="d-flex align-center">
          <v-img 
            src="https://img.icons8.com/?size=100&id=53386&format=png&color=000000"
            alt="BRUMI PRESENTES PERFUMADOS"
            class="logo-img d-md-none"
          />
          <v-app-bar-title class="text-h5 font-weight-bold text-white d-none d-md-block">BRUMI PRESENTES</v-app-bar-title>
        </div>
        <v-spacer></v-spacer>
        <v-btn variant="text" class="text-none text-white" @click="scrollToTop">Início</v-btn>
        <v-btn variant="text" class="text-none text-white" @click="scrollToSection('products')">Produtos</v-btn>
        <v-btn variant="text" class="text-none text-white" @click="scrollToSection('instagram')">Instagram</v-btn>
        <v-btn variant="text" class="text-none text-white" @click="scrollToBottom">Contato</v-btn>
      </v-container>
    </v-app-bar>

    <v-main class="main-content">
      <!-- Hero Section -->
      <section id="hero" class="hero-section">
        <div class="hero-content">
          <h1 class="text-h2 font-weight-bold text-white mb-4">BRUMI PRESENTES PERFUMADOS</h1>
          <p class="text-h5 text-white mb-8">Entregamos carinho em forma de presente.</p>
          <v-btn
            color="white"
            size="large"
            class="text-none text-primary mt-4 whatsapp-btn"
            variant="elevated"
            href="https://wa.me/5519991337245"
            target="_blank"
          >
            <v-icon start icon="mdi-whatsapp"></v-icon>
            Fazer Pedido
          </v-btn>
        </div>
        <div class="hero-divider"></div>
      </section>

      <!-- Featured Products Section -->
      <section id="products" class="section">
        <v-container class="fill-height d-flex flex-column justify-center">
          <h2 class="text-h3 text-center mb-8 font-weight-bold text-primary">Produtos em Destaque</h2>
          
          <v-window v-model="productWindow" class="mb-6">
            <v-window-item v-for="(group, i) in productGroups" :key="i">
              <v-row>
                <v-col v-for="product in group" :key="product.id" cols="12" md="4">
                  <v-card
                    class="mx-auto product-card"
                    elevation="2"
                    rounded="lg"
                  >
                    <v-img
                      :src="product.image"
                      height="300"
                      cover
                      class="product-image"
                    ></v-img>
                    <div class="product-divider"></div>
                    <v-card-title class="text-h5 font-weight-bold text-primary">{{ product.title }}</v-card-title>
                    <v-card-text class="product-content">
                      <p class="text-body-1">{{ product.description }}</p>
                      <p class="text-h6 font-weight-bold mt-4 text-secondary">R$ {{ product.price }}</p>
                    </v-card-text>
                    <v-card-actions class="product-actions">
                      <v-btn color="primary" variant="text" class="text-none">Ver Detalhes</v-btn>
                      <v-spacer></v-spacer>
                      <v-btn 
                        color="secondary" 
                        variant="text" 
                        class="text-none"
                        href="https://wa.me/5519991337245"
                        target="_blank"
                      >
                        <v-icon start>mdi-whatsapp</v-icon>
                        Comprar
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-col>
              </v-row>
            </v-window-item>
          </v-window>

          <div class="text-center">
            <v-btn-group>
              <v-btn
                v-for="(_, i) in productGroups"
                :key="i"
                :color="productWindow === i ? 'primary' : 'grey'"
                variant="text"
                @click="productWindow = i"
              >
                <v-icon>mdi-circle</v-icon>
              </v-btn>
            </v-btn-group>
          </div>
        </v-container>
      </section>

      <!-- Instagram Feed Section -->
      <section id="instagram" class="instagram-section">
        <div class="section-content">
          <h2 class="text-h3 text-center mb-8 text-primary font-weight-bold">Instagram</h2>
          <div class="instagram-grid">
            <InstagramEmbed
              v-for="(post, index) in instagramPosts"
              :key="index"
              :embed-code="post.embedCode"
            />
          </div>
    </div>
      </section>
    </v-main>

    <v-footer class="footer">
      <v-container>
        <v-row>
          <v-col cols="12" md="4">
            <h3 class="text-h6 text-white mb-4 font-weight-bold">BRUMIPRESENTES PERFUMADOS</h3>
            <p class="text-white">
              Cestas e Presentes Personalizados 💕<br>
              Kits e Mimos<br>
              📌 Rio Claro SP
            </p>
          </v-col>
          <v-col cols="12" md="4">
            <h3 class="text-h6 text-white mb-4 font-weight-bold">Contato</h3>
            <p class="text-white">
              📱 Pedidos pelo WhatsApp<br>
              <a href="https://wa.me/5519991337245" target="_blank" class="text-white text-decoration-none">
                (19) 99133-7245
              </a>
            </p>
          </v-col>
          <v-col cols="12" md="4">
            <h3 class="text-h6 text-white mb-4 font-weight-bold">Redes Sociais</h3>
            <v-btn
              icon
              class="mr-2"
              color="white"
              variant="text"
              href="https://www.instagram.com/brumipresentes/"
              target="_blank"
            >
              <v-icon>mdi-instagram</v-icon>
            </v-btn>
            <v-btn
              icon
              color="white"
              variant="text"
              href="https://wa.me/5519991337245"
              target="_blank"
            >
              <v-icon>mdi-whatsapp</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-footer>
  </v-app>
</template>

<style>
:root {
  --primary-color: #0a192f;
  --primary-light: #112240;
  --primary-dark: #020c1b;
}

.v-application {
  background-color: #f5f5f5 !important;
}

.v-btn--elevated {
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.2) !important;
}

.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to right, rgba(10, 25, 47, 0.9), rgba(17, 34, 64, 0.9)),
              url('https://fastly.picsum.photos/id/10/2500/1667.jpg?hmac=J04WWC_ebchx3WwzbM-Z4_KC_LeLBWr5LZMaAkWkF68');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 2rem;
  width: 100%;
  max-width: 800px;
}

.hero-divider {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(to right, #FFD700, #B8860B);
}

.products-section {
  padding: 80px 0;
  background-color: #f5f5f5;
  position: relative;
}

.products-section::before,
.products-section::after {
  content: '';
  position: absolute;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(to right, #FFD700, #B8860B);
}

.products-section::before {
  top: 0;
}

.products-section::after {
  bottom: 0;
}

.instagram-section {
  padding: 80px 0;
  background-color: #f5f5f5;
  position: relative;
}

.instagram-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(to right, #FFD700, #B8860B);
}

.v-card.product-card {
  height: 100% !important;
  display: flex !important;
  flex-direction: column !important;
  position: relative;
  padding: 2px;
  border-radius: 8px;
  background: white;
  max-width: 100%;
}

.v-card.product-card .v-card-text {
  flex: 1 1 auto !important;
  display: flex !important;
  flex-direction: column !important;
  min-height: 0;
  padding: 16px;
}

.v-card.product-card .v-card-actions {
  margin-top: auto !important;
  padding: 16px;
}

.product-divider {
  height: 2px;
  background: linear-gradient(to right, #FFD700, #B8860B);
  margin: 1rem 0;
}

.whatsapp-btn {
  width: auto;
  min-width: 200px;
  margin: 0 auto;
}

.logo-img {
  height: 40px;
  width: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.product-image {
  border-radius: 6px 6px 0 0;
}

.product-divider {
  width: 100%;
  height: 2px;
  background: linear-gradient(to right, #FFD700, #B8860B);
  margin: 0;
}

/* Scroll Snap Styles */
.section {
  min-height: 100vh;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  position: relative;
  padding: 80px 0;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.hero-subtitle {
  font-size: 1.5rem;
  color: white;
  margin-bottom: 2rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}

.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(10px);
  border-bottom: 2px solid;
  border-image: linear-gradient(to right, #FFD700, #B8860B) 1;
}

.footer {
  background: rgba(30, 136, 229, 0.95) !important;
  backdrop-filter: blur(10px);
  position: fixed;
  bottom: 0;
  width: 100%;
  z-index: 1000;
  height: 64px;
  position: relative;
}

.footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(to right, #FFD700, #B8860B);
}

/* Ajuste para o conteúdo não ficar escondido pelo footer */
.section:last-of-type {
  margin-bottom: 200px;
}

.instagram-grid {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  flex-wrap: nowrap;
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-title {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #333;
  text-align: center;
}

/* Responsive styles */
@media (max-width: 960px) {
  .section-title {
    font-size: 2rem;
    margin-bottom: 1.5rem;
  }

  .instagram-grid {
    flex-wrap: wrap;
    gap: 15px;
    padding: 0 15px;
  }

  .hero-section {
    background: linear-gradient(to right, #0a192f, #112240);
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.2rem;
  }

  .hero-image {
    opacity: 0.6;
  }

  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
    padding: 0 15px;
  }

  .product-image {
    height: 200px;
  }

  .product-title {
    font-size: 1.2rem;
  }

  .product-price {
    font-size: 1.1rem;
  }
}

@media (max-width: 600px) {
  .section-title {
    font-size: 1.8rem;
    margin-bottom: 1rem;
  }

  .instagram-grid {
    gap: 10px;
    padding: 0 10px;
  }

  .hero-section {
    background: linear-gradient(to right, #0a192f, #112240);
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .hero-image {
    opacity: 0.4;
  }

  .products-grid {
    grid-template-columns: 1fr;
    gap: 15px;
    padding: 0 15px;
  }

  .product-image {
    height: 180px;
  }

  .product-title {
    font-size: 1.1rem;
  }

  .product-price {
    font-size: 1rem;
  }

  .v-app-bar {
    padding: 0 10px;
  }

  .v-btn {
    font-size: 0.9rem;
    padding: 0 10px;
  }
}

.v-toolbar {
  background: rgba(30, 136, 229, 0.95) !important;
  backdrop-filter: blur(10px);
  position: relative;
}

.v-toolbar::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(to right, #FFD700, #B8860B);
}

.instagram-section {
  padding: 80px 0;
  position: relative;
}

.instagram-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(to right, #FFD700, #B8860B);
}

.whatsapp-btn {
  width: auto !important;
  min-width: 200px;
  margin: 0 auto;
}

.logo-img {
  height: 40px;
  width: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.product-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 8px;
  padding: 2px;
  background: linear-gradient(to right, #FFD700, #B8860B);
  -webkit-mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

.product-image {
  border-radius: 6px 6px 0 0;
}

.product-divider {
  width: 100%;
  height: 2px;
  background: linear-gradient(to right, #FFD700, #B8860B);
  margin: 0;
}
</style>
