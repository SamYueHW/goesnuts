const { SitemapStream, streamToPromise } = require('sitemap');
const fs = require('fs');
const path = require('path');

const links = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/home', changefreq: 'weekly', priority: 0.8 },
];

const stream = new SitemapStream({ hostname: 'https://chineseherbswholesaler.com.au' });

links.forEach(link => stream.write(link));
stream.end();

streamToPromise(stream).then(data => {
  fs.writeFileSync(path.resolve(__dirname, './public/sitemap.xml'), data);
  console.log("✅ Sitemap generated successfully!");
});
