# nodejs-open-redirect

1. After extracting the 'nodejs-open-redirect' dir, cd into it and run 'npm install' on cmd to generate dependency packages.

2. After the node_modules dir has been created, run 'node index.js' to run web app on http://localhost:3000/

3. Use user credentials (username: test, password: test) for the MyBank web app.

Note:
Included in the package is an SQL script 'nodelogin_setup_db.sql' for setting up the MySQL database 'nodelogin' and creating MySQL user 'nodelogin' with access to the db via password 'nodelogin'. 
This is required for the web app as it is configured to fetch/query from the specified MySQL database using the above stated credentials.
 
