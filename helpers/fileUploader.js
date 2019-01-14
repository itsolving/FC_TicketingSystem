let mkdirp = require('mkdirp');

module.exports = async function upload(files, url){
	console.log("Upload started")
	let time     = new Date(),
	    dirTime  = time.getTime(),
	    dirStr   =  Math.random()
	    				.toString(36)
	    				.slice(2, 2 + Math.max(1, Math.min(15, 25)) ),
	    finalDir = `${dirTime}${dirStr}`;



	let pageFile = files.page;


	mkdirp(`${__dirname}${url}`, async (err) => { 
		pageFile.mv(`${__dirname}${url}/${pageFile.name}`, function(err) {
		    if (err){
		    	console.log(err);
		    	return false;
		    }
		})
	})

	return true;
}