
rem start chrome debug mode
cd\
cd C:\Program Files (x86)\Google\Chrome\Application
chrome.exe --remote-debugging-port=9222 http://localhost:8080 

rem generate models TS
cd\
cd C:\node_projs\my-app\server\sequelize-auto-ts
node lib/cli.js 1 2 3 models postgres

rem generate models js
cd C:\node-projs\my-app
sequelize-auto -o "./server/models" -d d65otjbphfbmhh -h ec2-107-21-99-176.compute-1.amazonaws.com -u mqdzozcxbiyamv -p 5432 -x 5bf3cc051e66c5ee3a90ed7e19d7fafb26c8ddb1a1a725f2259727cd73a8f9ac -e postgres -c "./modelconfig.json"