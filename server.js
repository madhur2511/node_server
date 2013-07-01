fs = require("fs");
sys = require('sys');
express = require('express');

function min(a,b){
	return a>b?b:a;
}

function abc(){
	json=[];
	for(i=1;i<=99;++i)
		json.push('{"username":"'+String.fromCharCode((96+i))+'","name":"'+String.fromCharCode((97+i))+'"}');
	json.push('{"username":"'+String.fromCharCode((96+i))+'","name":"'+String.fromCharCode((97+i))+'"}');
	json='['+json+']';
	return json;
}

function def(from , to){
	json=[];
	data = JSON.parse(get_all_data());
	to = min(data.length , to);
	sys.puts(from+ ' '+to);
	for(i=from;i<to;++i){
		json.push(JSON.stringify(data[i]));
	}
	json='['+json+']';
	return json;
}

function search_for(query){
	json=[];
	data = JSON.parse(get_all_data());
	for(i in data){
		if((data[i].username == query) || (data[i].name == query)){
			json.push(JSON.stringify(data[i]));
		}
	}		
	json='['+json+']';
	return json;	
}

function write_to_file(){
	data=abc();
	fs.writeFile('json.json', JSON.stringify(data), function (err) {
		if(err){throw err;}
		console.log('json.json --Newly Created and Saved');
	});
	return data;
}

function read_from_file(){
	data = fs.readFileSync('/home/madhur/Desktop/server/json.json', 'utf8'); // If utf encoding is mentioned, return a string. Else, a buffer is returned.
	data = JSON.parse(data);
	console.log('json.json --Existed and Used');	
	return data;	
}

function get_all_data(){
	if(!fs.existsSync('/home/madhur/Desktop/server/json.json'))
		return write_to_file();
	else
		return read_from_file();
}

function get_data(limit,pageNo){
	from = (pageNo-1)*limit;
	to = (pageNo)*limit;
	return def(from,to);
}

var server = express();

server.get('/user',function(request,response){
	response.redirect('http://localhost:8080/user/page/1');			
});

server.get('/user/page/:page_no', function(request, response){
	total=100;
	current_page = parseInt(request.params.page_no);
	sys.puts("Request Received for "+request.url);

	perpage = request.query.perpage;
	if(!perpage) perpage=30;					  				       //Default per_page items = 30

	next_page_str='';previous_page_str='';
	if(perpage * current_page < total)
		next_page_str = 'http://localhost:8080/user/page/'+(current_page+1);
	if(current_page > 1)
		previous_page_str = 'http://localhost:8080/user/page/'+(current_page-1);

	response.links({
		next: next_page_str,
		previous: previous_page_str
	});
	response.writeHead(200, {'Content-Type':'application/json'});

	response.write(get_data(perpage , current_page));
	response.end();
});

server.get('/user/search',function(request,response){
	query = request.query.q;
	response.writeHead(200, {'Content-Type':'application/json'});
	response.write(search_for(query));
	response.end();
});

server.get('*', function(request, response){							//Resource Not Found at the Address
	response.send('Resource Not Found !! Y U NO TYPE PROPERLY !!', 404);
});

server.listen(8080);  
sys.puts("Server Running on 8080");  	