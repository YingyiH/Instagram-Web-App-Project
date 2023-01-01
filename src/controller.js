const fs = require("fs");
const { DEFAULT_HEADER } = require("./util/util");
const path = require("path");
const ejs = require("ejs");
var qs = require("querystring");
const formidable = require("formidable")
const database = require("../database/data.json")

const controller = {

  // to show the homepage
  getMainPage: async (request,response) => {
      const content = await ejs.renderFile(__dirname + "/views/home.ejs",{
          database
      });
      response.writeHead(200, DEFAULT_HEADER);
      response.end(content)
      // fs.createReadStream(__dirname + "/views/mainpage.html","utf8")
      // .pipe(response)     // way2
      // fs.readFile(__dirname + "/views/mainpage.html","utf8",(err,data)=>{
      //     response.end(data)  // way3
      // })
  },

  // write the response for the browser:
  getFeed: async (request, response) => {
    const urlElement = request.url.split("=")
    const username = urlElement[1]
    let index = 0
    postPic = []
    for (const item of database){
      if (username == item.username){
        index = database.indexOf(item)
      }
    }
    for (const picture in database[index].photos){
      postPic.push(database[index].photos[picture])
  }
    //http://localhost:3000/feed?username=john123
    const content = await ejs.renderFile(__dirname + "/views/userpage.ejs",{
        username,database,index,postPic
    });
    response.end(content)
  },

  //-----------------------------------------------------------------------------
  uploadFile: async (request, response) => {
    const content = await ejs.renderFile(__dirname + "/views/images.ejs",{
      database
    });
    response.writeHead(200, DEFAULT_HEADER)
    response.end(content)
  },


  uploadImages: async (request, response) => {
    // variables
    let index = 0
    let username = ""
    let filename = "pic"

    const form = new formidable.IncomingForm({ keepExtensions: true, uploadDir: __dirname + "/uploads"});
    // fields -> empty
    // files -> a dictionary to store the information of the file
    form.parse(request, (err, fields, files) => {
      if(err){response.writeHead(err.httpCode || 400 , {'Content-Type': 'text/plain'})
      response.end(String(err))
      return;
      }
      response.writeHead(302, {
        'Location': '/'
      });

      //Appending upload files to json file in specific user dictionary

      for (const item of database){
        if (username == item.username){
          index = database.indexOf(item)
        }
      }
      Object.entries(files).forEach(([key, value]) => {
        let number = 3
        // const fileExtension = value.newFilename.split(".")[1] //define file extension
        const fileExtension = "png"
        const username = key

        // update to the json file
        const data = fs.readFileSync("./database/data.json")
        const newContent = JSON.parse(data)

        for (const item of newContent){
            // console.log(item.username)
            if(item.username == username){
              item.stats.posts += 1
              number = item.stats.posts - 1
              item.photos.push(filename+number+"."+fileExtension)
            }
        }

        const oldpath = path.join(__dirname +"/uploads/" + value.newFilename)
        const newpath = path.join(__dirname+"/photos/"+username+"/"+filename+number+"."+fileExtension)
        // const newpath = path.join(__dirname+"/photos/"+username+"/"+value.originalFilename)

        fs.rename(oldpath, newpath,()=>{console.log("Add file to folder successfully.")})
          fs.writeFile(path.join("./database/data.json"),JSON.stringify(newContent),(err,data)=>{
            if(err){throw err}
            console.log("add files successfully")
          })
      });
      
      response.end();
      return;
    });
  }
}

module.exports = controller;
