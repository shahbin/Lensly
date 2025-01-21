const express = require("express")
const router = express.Router()
const passport = require("passport")
const userController = require("../controllers/user/userController")
const productController = require("../controllers/user/productController")
const profileController = require("../controllers/user/profileController") 
const {userAuth,adminAuth, checkUser} = require("../middlewares/auth")


router.get("/pageNotFound",userController.pageNotFound)
router.get('/signup', checkUser, userController.loadSignup)
router.post('/signup',userController.signup)
router.post('/verify-otp',userController.verifyOtp)
router.post('/resend-otp',userController.resendOtp)
router.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );
  
  router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/signup' }),
    (req, res) => {
      console.log('Authentication successful');
      console.log('User:', req.user);
      req.session.user = req.user._id;
      return res.redirect('/');
    }
);
router.get("/",userController.loadHomePage)
router.get('/login', checkUser, userController.loadLogin)
router.post('/login',userController.login)
router.get("/logout",userController.logout)
router.get('/shop',userController.loadShopPage)
router.get('/productDetails',productController.productDetails)
router.get('/userProfile',userAuth,profileController.userProfile)
router.post('/editProfile',userAuth, profileController.editProfile)
router.post('/changePassword', userAuth, profileController.changePassword);
// router.get('/account', userController.loadMyAccount)
// router.get('/compare',userController.loadCompare)



module.exports = router;
