# Create db
mysql -u root -pWelcome1 < db_script/initial_script.sql

cd video_generator
nohup node index.js &

cd ../slideshow_player
nohup npm start &