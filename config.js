exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                       'mongodb://localhost/blog-posts';
exports.PORT = process.env.PORT || 8080;
//mongo ds117830.mlab.com:17830/blog-posts -u anhhtle -p password1
//mongoimport -h ds117830.mlab.com:17830 -d blog-posts -c blogPosts -u anhhtle -p password1 --file ~/Desktop/seed-data.json