const apn = require("apn")
const express = require("express")
const app = express()
const port = 3001;
require('dotenv').config();
const options = {
   cert: process.env.CERT_PATH,
   key: process.env.CERT_KEY_PATH,
   production: false
}
const provider = new apn.Provider(options);
const sendNotification = (name, image, deviceToken) => {
   let notification = new apn.Notification();
   console.log("Sending.")
   notification.pushType = "voip"
   notification.topic = process.env.NOTIFICATION_TOPIC
   notification.alert = "test"
   notification.payload = {"name": name, pp: image}
   return new Promise((resolve, reject) => {
      provider.send(notification, deviceToken).then((res) => {
         console.log(JSON.stringify(res))
         if(res.sent.length > 0) {
            return resolve(res)
         }else{
            return reject(res)
         }

      })
   })

}
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get("/", async(req, res) => {
   const {deviceToken, name, imageUrl} = req.body;
   if(!deviceToken || !name || !imageUrl) {
      return res.status(400).json({"code": "-1", "message": "Invalid request"})
   }
   try {
      await sendNotification(name, imageUrl, deviceToken);
      console.log("Notification sent successfully.");
      return res.status(200).json({"code": "0", "message": "Notification sent successfully."});
   } catch (error) {
      console.error("Error sending notification:", error);
      return res.status(500).json({"code": "-1", "message": "An error occurred while sending the notification."});
   }
})

app.listen(port, () => {
   console.log(`Apn app running on port ${port}`)
})

module.exports = {sendNotification}