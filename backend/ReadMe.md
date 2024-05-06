1. If database is empty than create a database, collection and insert all data from the csv file which is available on a specification location the pc.
2. Check if new records exist in csv file by comparing csv data with database > collection data which is available on a specification location the pc.
4. Take first row's specific column which will have data like urls and open it in selenium.
5. Redirect to that and try to login in that using email and password avaiable in .env.
6. Website will send an OTP on a specific number which user will enter manually. So, our code will check each sec that if we are successfully logged-in or not. We can fid specific text  and match it or may be judge from current url that we are logged-In successfully.
7. After logged-In as you know we will be automatically redirected than we will wait 10sec on that page, additional automation we will define later.
8. Exact same process will repeat on each url available in database which we inserted in database after comparing from csv.
9. We will check that csv file after every 20 minutes.
10. If new data/row exists or deleted from that or in that csv than sent an email to a specific address.
11. Upon update we will repeat that same process as well.
12. There should be an function or controller that will check before every automation that if we are already loggedIn in the website.
13. We can save the profile of the user as well. Hence we don't do login each time.