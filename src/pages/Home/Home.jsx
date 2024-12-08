// src/Home.js
import React from 'react';

const Home = () => {
  const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>Chang Hong Herbs</title>
      <link rel="stylesheet" href="css/style.css">
      <link rel="stylesheet" href="css/responsive.css">
    </head>
    <body>
      <div class="main-page-wrapper">
        <!-- Header Section -->
       

        <!-- Main Banner -->
        <section>
          <div id="theme-main-banner">
            <div data-src="images/home/banner-slider-1.jpg">
              <div class="camera_caption">
                <div class="container text-center">
                  <h1 class="wow fadeInUp animated" data-wow-delay="0.2s">Love Your Health, Embrace Traditional Chinese Medicine</h1>
                  <span class="wow fadeInUp animated" data-wow-delay="0.5s"> With over 15 years of experience in Traditional Chinese Medicine </span>
                  <p class="wow fadeInUp animated" data-wow-delay="0.8s">High-quality herbs and professional services for your health</p>
                  <a href="#" class="tran3s wow fadeInLeft animated banner-button-left" data-wow-delay="1s">Shop Now</a>
                </div>
              </div>
            </div>
          </div>
        </section>

     			<!-- banner-bottom-section ____________________________ -->
			<section class="banner-bottom-section">
				<div class="container">
					<div class="row">
						<div class="col-sm-4 col-xs-12">
							<div class="banner-bottom-item">
								<div class="banner-bottom-contante text-center">
									<i class="flaticon-egyptian-cat"></i>
									<h6><a href="#">Premium Herbal Medicine</a></h6>
									<p>Offer the highest quality and authentic herbs</p>
								</div>
							</div>
						</div>
						<div class="col-sm-4 col-xs-12">
							<div class="banner-bottom-item">
								<div class="banner-bottom-contante text-center">
									<i class="flaticon-dog-training"></i>
									<h6><a href="#">Wide Variety of Products</a></h6>
									<p>A comprehensive selection to meet all customer needs</p>
								</div>
							</div>
						</div>
						<div class="col-sm-4 col-xs-12">
							<div class="banner-bottom-item">
								<div class="banner-bottom-contante text-center">
									<i class="flaticon-pawprint"></i>
									<h6><a href="#">Competitive Prices</a></h6>
									<p>The lowest prices, unmatched in the market!</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<!-- We are myPet ____________________________ -->
			<section class="we-are-my-pet-section">
				<div class="container">
					<div class="row">
						<div class="col-md-6 col-xs-12">
							<div class="we-are-my-pet-text">
								<span></span>
								<h2>We are <span>Chang<span>Hong</span></span></h2>
								<p>Welcome! At Chang Hong, we understand that managing your health can be time-consuming. Ensuring that you get the best price for quality herbs and medicinal products can easily be overlooked, even though it can lead to substantial savings each year. We strive to establish an open and honest relationship with our clients, and we value empowering you to become as knowledgeable as possible in identifying quality.</p>
								<p>Our carefully selected supplier, Kwok Shing Hong Medical Co. Ltd., is based in Hong Kong and is internationally renowned. With a long trading history and their famous brand ‘Double Horse’, Kwok Shing Hong has gained popularity worldwide. They own on-site factories and processing facilities located in Shenzhen, and have passed the “international standard assessment of quality control for medications” (GMP), ensuring the highest standards in herbal medicine.</p>
								<a href="#" class="hvr-float-shadow">Know More</a>
							</div>
						</div>
						<div class="col-md-6 col-xs-12">
							<div class="we-are-my-pet-img">
								<img src="images/home/img-1.jpg" alt="image">
								<div></div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<!-- Our Pet Services ____________________________ -->
			<section class="our-pet-services-section">
				<div class="container">
					<div class="them-title text-center">
						<span></span>
						<h2>Our Herbal Services</h2>
						<p>Best Herbal Care is dedicated to providing the finest natural remedies and traditional Chinese medicine for your health and wellness needs.</p>
					</div>

					<div class="row our-pet-services">
						<div class="col-md-4 col-xs-6 our-pet-services-item-width">
							<div class="our-pet-services-item">
								<div class="our-pet-services-img">
									<img src="images/home/img-2.jpg" alt="image" style="height: 231.67px;">
								</div>
								<div class="our-pet-services-text">
									<h5><a href="#">FREE SAMPLE PACKAGING</a></h5>
									<p>Enjoy free sample packaging and discover the natural healing power of our remedies at no cost.</p>
								</div>
							</div>
						</div>
						<div class="col-md-4 col-xs-6 our-pet-services-item-width">
							<div class="our-pet-services-item">
								<div class="our-pet-services-img">
									<img src="images/home/img-3.png" alt="image">
								</div>
								<div class="our-pet-services-text">
									<h5><a href="#">FREE SHIPPING</a></h5>
									<p>Get free shipping on all orders over a certain amount. Your wellness is our priority.</p>
								</div>
							</div>
						</div>
						<div class="col-md-4 col-xs-6 our-pet-services-item-width">
							<div class="our-pet-services-item">
								<div class="our-pet-services-img">
									<img src="images/home/img-4.jpg" alt="image"  style="height: 231.67px;">
								</div>
								<div class="our-pet-services-text">
									<h5><a href="#">PERSONALIZED CONSULTATION</a></h5>
									<p>Get tailored advice from our expert herbalists to meet your health needs.</p>
								</div>
							</div>
						</div>
						<!-- <div class="col-md-4 col-xs-6 our-pet-services-item-width">
							<div class="our-pet-services-item">
								<div class="our-pet-services-img">
									<img src="images/home/img-5.jpg" alt="image">
								</div>
								<div class="our-pet-services-text">
									<h5><a href="#">DOG WALKING</a></h5>
									<p>Whether your pet needs a scratch around the ear, a face to lick or a place to play,</p>
								</div>
							</div>
						</div>
						<div class="col-md-4 col-xs-6 our-pet-services-item-width">
							<div class="our-pet-services-item">
								<div class="our-pet-services-img">
									<img src="images/home/img-6.jpg" alt="image">
								</div>
								<div class="our-pet-services-text">
									<h5><a href="#">PET DAYCARE</a></h5>
									<p>Best Friends Pet Care is the leader of the pack when it comes to the absolute best care for your cat or dog.</p>
								</div>
							</div>
						</div>
						<div class="col-md-4 col-xs-6 our-pet-services-item-width">
							<div class="our-pet-services-item">
								<div class="our-pet-services-img">
									<img src="images/home/img-7.jpg" alt="image">
								</div>
								<div class="our-pet-services-text">
									<h5><a href="#">Nice Product</a></h5>
									<p>In a professional context it often happens that private or corporate clients order a publication</p>
								</div>
							</div>
						</div> -->
					</div>
				</div>
			</section>

			<!-- Company History _________________________________ -->
			<section class="company-history-section">
				<div class="company-history-shape-img-top"><img src="images/shape-1.png" alt="shape-img"></div>
				<div class="company-history-containt-opact">
					<div class="container">
						<div class="row">
							<div class="col-lg-3 col-xs-6 history-item-weight">
								<div class="clear-fix">
									<div class="history-item item-one">
										<div>
											<i class="flaticon-handshake"></i>
											<p>Partnered Companies</p>
											<h2><span class="timer" data-from="0" data-to="200" data-speed="2000" data-refresh-interval="5">0</span></h2>
										</div>
									</div>
								</div>
							</div>
							<div class="col-lg-4 col-xs-6 history-item-weight">
								<div class="clear-fix">
									<div class="history-item item-two">
										<div>
											<i class="flaticon-satisfaction"></i>
											<p>Customer Satisfaction</p>
											<h2><span class="timer" data-from="0" data-to="100" data-speed="2000" data-refresh-interval="5">0</span>%</h2>
										</div>
									</div>
								</div>
							</div>
							<div class="col-lg-2 col-xs-6 history-item-weight col-item-three">
								<div class="clear-fix">
									<div class="history-item item-three">
										<div>
											<i class="flaticon-construction"></i>
											<p>Herbal Products Variety</p>
											<h2><span class="timer" data-from="1000" data-to="1107" data-speed="2000" data-refresh-interval="5">0</span></h2>
										</div>
									</div>
								</div>
							</div>
							<div class="col-lg-3 col-xs-6 history-item-weight">
								<div class="clear-fix">
									<div class="history-item item-four">
										<div>
											<i class="flaticon-medal"></i>
											<p>Years in Business</p>
											<h2><span class="timer" data-from="0" data-to="15" data-speed="2000" data-refresh-interval="5">0</span></h2>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<!-- Our pet health ____________________________ -->
			<!-- <section class="our-pet-health-section">
				<div class="container">
					<div class="row">
						<div class="col-md-6 col-xs-12">
							<div class="our-work-process">
								<h4>Our pet health care System</h4>
								<p>The doctors and staff at Pet Care Veterinary Hospital have years of experience treating a variety of reptiles including Bearded Dragons, Geckos, Snakes and Tortoises. Our hospital offers physical exams, vaccinations, nutrition, behavioral and environmental enrichment information for your pet ferret.</p>
								<div class="row">
									<div class="col-xs-6">
										<div class="">
											<i class="flaticon-dog-training"></i>
											<h6><a href="#">Home Delivery</a></h6>
										</div>
									</div>
									<div class="col-xs-6">
										<div class="">
											<i class="flaticon-snowshoe-cat"></i>
											<h6><a href="#">QUALITY Pet</a></h6>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div class="col-md-6 col-xs-12">
							<div class="doing-the-right-thing">
								<h5>Doing the right thing, Discover Our Products</h5>
								<p>Our veterinarians and staff understand the importance of the special bond you share with your pet and are dedicated to providing the best that modern veterinary care has to offer</p>
								<div class="inspiration-tab">
									<div class="inspiration-panel">
										<div class="panel-group theme-accordion" id="accordion">
										  <div class="panel">
										    <div class="panel-heading active-panel">
										      <h6 class="panel-title">
										        <a data-toggle="collapse" data-parent="#accordion" href="#collapse1">
										        Trusted Pet Sitters Across the Country</a>
										      </h6>
										    </div>
										    <div id="collapse1" class="panel-collapse collapse in">
										      <div class="panel-body">
										      	<p>The perfect harmony between innovation and creativity, our bathroom tiles are produced in compliance with the international standards. High quality 20mm thick porcelain tiles that can be laid on pedestals,</p>
										      </div>
										    </div>
										  </div> /panel 1 -->
										  <!-- <div class="panel">
										    <div class="panel-heading">
										      <h6 class="panel-title">
										        <a data-toggle="collapse" data-parent="#accordion" href="#collapse2">
										        What can I offer my bird as a treat?</a>
										      </h6>
										    </div>
										    <div id="collapse2" class="panel-collapse collapse">
										      <div class="panel-body">
										      	<p>The perfect harmony between innovation and creativity, our bathroom tiles are produced in compliance with the international standards. High quality 20mm thick porcelain tiles that can be laid on pedestals,</p>
										      </div>
										    </div>
										  </div>  /panel 2 -->
										  <!-- <div class="panel">
										    <div class="panel-heading">
										      <h6 class="panel-title">
										        <a data-toggle="collapse" data-parent="#accordion" href="#collapse3">
										        When Your Rabbit Stops Eating</a>
										      </h6>
										    </div>
										    <div id="collapse3" class="panel-collapse collapse">
										      <div class="panel-body">
										      	<p>The perfect harmony between innovation and creativity, our bathroom tiles are produced in compliance with the international standards. High quality 20mm thick porcelain tiles that can be laid on pedestals,</p>
										      </div>
										    </div>
										  </div> /panel 3 -->
										</div> <!-- end #accordion -->
									</div> <!-- End of .inspiration-panel -->
								</div>
							</div>
						</div>
					</div>
				</div>
			</section> 

			<!-- Client Review ____________________________ -->
			<div class="client-slider">
				<div class="opacity">
					<div class="container">
						<div class="them-title text-center">
							<span></span>
							<h2>Client Review</h2>
						</div> <!-- /.theme-title -->
						<div class="testimonial-slider">
							<div id="client-review-slider" class="owl-carousel owl-theme">
								<div class="item">
									<div class="clearfix">
										<img src="images/home/img-10.jpg" alt="" class="float-left">
										<div class="name float-left">
											<h6>Jane Liu</h6>
											<p>Owner, Herbal Harmony</p>
										</div> <!-- /.name -->
									</div> <!-- /.clearfix -->
									<div class="text">
										<p>The variety and quality of herbal products from this wholesaler are unmatched. Our customers love them, and our business has grown significantly.</p>
									</div>
								</div> <!-- /.item -->
								<div class="item">
									<div class="clearfix">
										<img src="images/home/img-10.jpg" alt="" class="float-left">
										<div class="name float-left">
											<h6>Michael Chen</h6>
											<p>CEO, Nature's Cure</p>
										</div> <!-- /.name -->
									</div> <!-- /.clearfix -->
									<div class="text">
										<p>We've been sourcing our herbs from this supplier for over 5 years. Their products are always fresh, and the customer service is exceptional.</p>
									</div>
								</div> <!-- /.item -->
								<div class="item">
									<div class="clearfix">
										<img src="images/home/img-10.jpg" alt="" class="float-left">
										<div class="name float-left">
											<h6>Emily Zhang</h6>
											<p>Manager, Health First</p>
										</div> <!-- /.name -->
									</div> <!-- /.clearfix -->
									<div class="text">
										<p>The personalized consultations have been incredibly helpful. We feel confident recommending their products to our clients.</p>
									</div>
								</div> <!-- /.item -->
							</div> <!-- /.col- -->
						</div> <!-- /.row -->
						

	

			<!-- Partner Logo ____________________________ -->
	        <div class="partners-section">
				<div class="container">
					<div class="">
						<div id="partner-logo" class="owl-carousel owl-theme">
							<div class="item"><div><img src="images/home/slide-logo-1.jpg" alt="logo"></div></div>
							<div class="item"><div><img src="images/home/slide-logo-1.jpg" alt="logo"></div></div>
							<div class="item"><div><img src="images/home/slide-logo-1.jpg" alt="logo"></div></div>
							<div class="item"><div><img src="images/home/slide-logo-1.jpg" alt="logo"></div></div>
							<div class="item"><div><img src="images/home/slide-logo-1.jpg" alt="logo"></div></div>
						</div> <!-- End .partner_logo -->
					</div>
				</div>
			</div>

			<!-- Footer ____________________________ -->
			<!-- <footer>
				<div class="container">
					<div class="top-footer row">
						<div class="col-md-5 col-sm-7 col-xs-12 footer-logo">
							<a href="#"><img src="images/them-logo/them-main-logo-1.jpg" alt="Logo"></a>
							<p><span class="p-color">myPet</span> was established in 2017 by Pet business veterans, Rod Davies and Matthew Levington, the journey began when founders Matthew Levington and Rod Davies, met up in 2017 over a beer</p>
							<ul class="icon">
								<li><a href="" class="tran3s"><i class="fa fa-facebook" aria-hidden="true"></i></a></li>
								<li><a href="" class="tran3s"><i class="fa fa-linkedin" aria-hidden="true"></i></a></li>
								<li><a href="" class="tran3s"><i class="fa fa-dribbble" aria-hidden="true"></i></a></li>
								<li><a href="" class="tran3s"><i class="fa fa-twitter" aria-hidden="true"></i></a></li>
							</ul>

							<ul class="policy">
								<li><a href="" class="tran3s">Privacy Policy </a></li>
								<li><a>|</a></li>
								<li><a href="" class="tran3s">Legal Policy</a></li>
							</ul>
						</div> 

						<div class="col-md-4 col-sm-5 col-xs-12 footer-list">
							<h5>Important Links</h5>

							<ul>
								<li><a href="#" class="tran3s">Support</a></li>
								<li><a href="#" class="tran3s">About us </a></li>
								<li><a href="#" class="tran3s">Project</a></li>
								<li><a href="shop.html" class="tran3s">Shop</a></li>
								<li><a href="#" class="tran3s">Performance</a></li>
								<li><a href="#" class="tran3s">News</a></li>
								<li><a href="#" class="tran3s">Pet Health Food</a></li>
							</ul>
							<ul>
								<li><a href="#" class="tran3s">Pet</a></li>
								<li><a href="#" class="tran3s">Our History</a></li>
								<li><a href="#" class="tran3s">What We Do</a></li>
								<li><a href="#" class="tran3s">Living Areas</a></li>
								<li><a href="#" class="tran3s">Pet Product</a></li>
								<li><a href="contact-us.html" class="tran3s">Contact us</a></li>
							</ul>
						</div>

						<div class="col-md-3 col-xs-12 footer-news">
							<h5>News Update</h5>

							<ul>
								<li>
									<h6><a href="#" class="tran3s">Prefinished Solid Hardwood Flooring</a></h6>
									<span>january 02,2017</span>
								</li>
								<li>
									<h6><a href="#" class="tran3s">Latst pet care in summer 12 care them well</a></h6>
									<span>january 02,2017</span>
								</li>
							</ul>
						</div> 
					</div>
				</div> 
				<div class="bottom-footer">
					<div class="container">
						<p class="float-left">Copyright &copy; 2017.Company name All rights reserved.<a target="_blank" href="http://www.mobancss.com/">模板在线</a></p>
						<form action="#" class="float-right">
							<input type="text" placeholder="Your Email">
							<button class="tran3s p-bg-color">Subscribe</button>
						</form>
					</div> 
				</div>
			</footer>
			 -->
		</div> <!-- /.main-page-wrapper -->
		


		<!-- Scroll Top Button -->
		<button class="scroll-top tran7s p-color-bg">
			<i class="fa fa-angle-up" aria-hidden="true"></i>
		</button>




        <!-- Footer -->
        <script src="./vendor/jquery-2.2.3.min.js"></script>
        <script src="./vendor/bootstrap-select-1.10.0/dist/js/bootstrap-select.min.js"></script>
        <script src="./vendor/bootstrap/js/bootstrap.min.js"></script>
        <script src="./vendor/Camera-master/scripts/camera.min.js"></script>
        <script src="./vendor/Camera-master/scripts/jquery.easing.1.3.js"></script>
        <script src="./vendor/OwlCarousel2/dist/owl.carousel.min.js"></script>
        <script src="./vendor/jquery.appear.js"></script>
        <script src="./vendor/jquery.countTo.js"></script>
        <script src="./vendor/fancybox/dist/jquery.fancybox.min.js"></script>
        <script src="./vendor/isotope.pkgd.min.js"></script>
        <script src="./vendor/WOW-master/dist/wow.min.js"></script>
        <script src="./vendor/circle-progress.js"></script>
        <script src="js/custom.js"></script>
      </div>
    </body>
  </html>
  `;

  return (
    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
  );
};

export default Home;
