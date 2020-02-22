// import biblioteke i klijenta za spoj na bazu
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

// URL za bazu - moze se vidjeti iz Mongo Atlas sucelja
const dbUrl = "mongodb+srv://jopa:mongo2020pass@musix-7nttr.mongodb.net/test?retryWrites=true&w=majority";
const dbOptions = { useNewUrlParser: true, useUnifiedTopology: true };

function spojNaBazu(imeBaze, imeKolekcije, success, failure) {
	MongoClient.connect(dbUrl, dbOptions, function (err, dbInstance) {
		if (err) {
			console.log(`Pogreska pri spajanju na bazu: ${err}`);
			failure(err);
		} else {
            //Dohvacamo instancu baze
            const dbObjekt = dbInstance.db(imeBaze);
            //Dohvacamo zeljenu kolekciju ("tablicu")
			const dbCollection = dbObjekt.collection(imeKolekcije);

            console.log("Uspjesno spojen na bazu");
            //Pozivamo callback za uspjesnu konekciju
			success(dbCollection);
		}
	});
}

module.exports = { spojNaBazu };