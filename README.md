### How to install:

* Clone or fork this repo
* Install NodeJS and MongoDB
* Run `npm install` 
* run `mongoimport --db uberForX --collection cops --drop --file ./db/cops.json` to import sample cop information in MongoDB
* run `mongoimport --db uberForX --collection requests --drop --file ./db/crime-data.json` to import sample crime information in MongoDB

### How to run:

* run `node app.js` 
* Open a demo civilian page by going to http://localhost:8000/civilian.html?userId=YOURNAME
* Open 3 or more cop pages from the imported cop profiles on separate tabs - [01](http://localhost:8000/cop.html?userId=01), [02](http://localhost:8000/cop.html?userId=02), [03](http://localhost:8000/cop.html?userId=03), [04](http://localhost:8000/cop.html?userId=04), [05](http://localhost:8000/cop.html?userId=05), [06](http://localhost:8000/cop.html?userId=06), [07](http://localhost:8000/cop.html?userId=07)

