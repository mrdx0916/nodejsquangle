const express = require("express");
const bodyParser = require("body-parser");
const config = require("config");
//package để xây đường dẫn
const path = require("path");
const passport = require("passport");
const passportStrategy = require("passport-facebook-token");
const jwt = require("jsonwebtoken");
const cors = require("cors");

require("./db/connect");

const tripRouter = require("./routers/trip");
const branchRouter = require("./routers/branch");
const carRouter = require("./routers/car");
const stationRouter = require("./routers/station");
const authRouter = require("./routers/auth");
const uploadRouter = require("./routers/upload");
const User = require("./models/user");

const app = express();

passport.use(
  "facebookToken",
  new passportStrategy(
    {
      clientID: "849986432462828",
      clientSecret: "eb5ff3d6a86f8d800197c41dc1a154be",
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log(profile);
      const userEmail = profile.emails[0].value;
      const userAvatar = profile.photos[0].value;

      const foundedUser = await User.findOne({ email: userEmail });
      let user = foundedUser;

      if (!foundedUser) {
        const newUser = new User({
          email: userEmail,
          role: "user",
          avatar: userAvatar,
        });
        user = await newUser.save();
      }

      done(null, user);
    }
  )
);

/**
 * TODO
 *  .CRUD Branch
 *  .CRUD Car
 *  .CRUD Station
 *  .CRUD Trip
 *  .signup, signin, jwt, track tokens , authorization, logout ,log out all
 *  .Booking Ticket
 *  .Refactor - mvc, router,
 *  .Giới thiệu buffer - stream
 *  .Upload file - filter type,limit size, serve static file
 *  .Send email
 *  .facebook login
 *  .cors
 *  .git
 *  .deploy
 *
 */

//closure

const imagesFolderPath = path.join(__dirname, "images");

app.use(
  cors({
    origin: "http://localhost:5500",
    optionsSuccessStatus: 200,
  })
);

app.use(bodyParser.json());
app.use("/images", express.static(imagesFolderPath));

app.use(tripRouter);
app.use(branchRouter);
app.use(carRouter);
app.use(stationRouter);
app.use(authRouter);
app.use(uploadRouter);
app.post(
  "/login/facebook",
  passport.authenticate("facebookToken", { session: false }),
  async (req, res) => {
    const token = await jwt.sign(
      {
        _id: req.user._id,
      },
      "vexerejwt"
    );
    req.user.tokens.push(token);
    await req.user.save();

    res.send(token);
  }
);

const port = config.get("port");

app.listen(port, () => {
  console.log("listening.....");
});
