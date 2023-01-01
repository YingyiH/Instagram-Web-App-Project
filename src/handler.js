const { parse } = require("url");
const { DEFAULT_HEADER,JPEG_IMAGE_HEADER } = require("./util/util.js");
const controller = require("./controller");
const { createReadStream,createWriteStream } = require("fs");
const path = require("path");

const allRoutes = {
  // GET: localhost:3000
  "/:get": (request, response) => {
    controller.getMainPage(request, response);
  },
  // POST: localhost:3000/form
  "/form:post": (request, response) => {
    controller.sendFormData(request, response);
  },
  // POST: localhost:3000/images
  "/images:post": (request, response) => {
    controller.uploadImages(request, response);
    controller.uploadFile(request, response);
  },
  // GET: localhost:3000/feed
  // Shows instagram profile for a given user
  "/feed:get": (request, response) => {
    controller.getFeed(request, response);
  },

  // 404 routes
  default: (request, response) => {
    response.writeHead(404, DEFAULT_HEADER);
    createReadStream(path.join(__dirname, "views", "404.html"), "utf8").pipe(
      response
    );
  },

  //--------------------------------------------------------------------------

    //Image:
  // "/src/Instagram-IG-Logo.png:get": (request, response) =>{
  //   response.writeHead(200,JPEG_IMAGE_HEADER)
  //   createReadStream("./src/Instagram-IG-Logo.png").pipe(response);
  // },
  // "/src/ui1.png:get": (request, response) =>{
  //   response.writeHead(200,JPEG_IMAGE_HEADER)
  //   createReadStream("./src/ui1.png").pipe(response);
  // },
  // "/src/ui2.png:get": (request, response) =>{
  //   response.writeHead(200,JPEG_IMAGE_HEADER)
  //   createReadStream("./src/ui2.png").pipe(response);
  // },
  // "/src/photos/john123/profile.jpeg:get": (request, response) =>{
  //   response.writeHead(200,JPEG_IMAGE_HEADER)
  //   createReadStream("./src/photos/john123/profile.jpeg").pipe(response);
  // },
  // "/src/photos/sandra123/profile.jpeg:get": (request, response) =>{
  //   response.writeHead(200,JPEG_IMAGE_HEADER)
  //   createReadStream("./src/photos/sandra123/profile.jpeg").pipe(response);
  // },
  
  // // USER PHOTOS
  // "/src/photos/john123/pic1.png:get": (request, response) =>{
  //   response.writeHead(200,JPEG_IMAGE_HEADER)
  //   createReadStream("./src/photos/john123/pic1.png").pipe(response);
  // },
  // "/src/photos/john123/pic2.png:get": (request, response) =>{
  //   response.writeHead(200,JPEG_IMAGE_HEADER)
  //   createReadStream("./src/photos/john123/pic2.png").pipe(response);
  // },
  // "/src/photos/sandra123/pic1.png:get": (request, response) =>{
  //   response.writeHead(200,JPEG_IMAGE_HEADER)
  //   createReadStream("./src/photos/sandra123/pic1.png").pipe(response);
  // },
  // "/src/photos/sandra123/pic2.png:get": (request, response) =>{
  //   response.writeHead(200,JPEG_IMAGE_HEADER)
  //   createReadStream("./src/photos/sandra123/pic2.png").pipe(response);
  // },
};

function handler(request, response) {
  const { url, method } = request;

  const { pathname } = parse(url, true);

  let key = `${pathname}:${method.toLowerCase()}`;
  console.log(key)

  if (pathname.includes("png")| pathname.includes("jpeg")){
    const fullpath = __dirname + pathname
    key = `${fullpath}:get`;
    allRoutes[key] = (request, response) => {
      response.writeHead(200,JPEG_IMAGE_HEADER)
      createReadStream(fullpath).pipe(response);
    }
    const chosen = allRoutes[key] || picRoutes.default;
    return Promise.resolve(chosen(request, response)).catch(
      handlerError(response)
  );
  }

  const chosen = allRoutes[key] || allRoutes.default;

  return Promise.resolve(chosen(request, response)).catch(
    handlerError(response)
  );
}

function handlerError(response) {
  return (error) => {
    console.log("Something bad has  happened**", error.stack);
    response.writeHead(500, DEFAULT_HEADER);
    response.write(
      JSON.stringify({
        error: "internet server error!!",
      })
    );

    return response.end();
  };
}

module.exports = handler;
