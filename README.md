WEBDEV PROJECT FOR WEBDEV CLUB

Hi, I am Sriram.
This project is a complete website built for the Web Dev Cell of IIT Mandi. The main goal of this platform is to bring all club-related activities into one place so that students do not lose track of resources, events, announcements, and session content.
Introduction:

Whenever a session happens, a lot of useful content is generated. Sometimes this information is available only for a short time, and sometimes it gets lost later. This is especially true for web development sessions, since web development is a vast field with a lot to explore and learn.
Me and My friend built this website to solve that problem by organizing everything in one place. 
With this platform, all the enthuiastic students can access session resources, check upcoming and past events, explore club activities, and stay connected with the Web Dev Cell.

This is what we have built:
  1) Public Website:
      We created a public-facing website for the Web Dev Cell where users can learn about:
        1) what the club does
        2) the projects the club is involved in
        3) the overall presence and activities of the club

  2) Authentication:
      1) The login system uses Firebase Authentication.(This makes it safe for login of any user)
    Process for the login:
      Users need use thier institute email to sign in and access the user side of the website.

  3) User Side:
    1) We had built a dedicated user workspace where members can access different features easily.
     Useful nature:
       This dashboard helps users navigate across different pages and gives them access to important sections of the platform.

  4) Events Page:
      we built a dedicated Events page where users can:
       1)view upcoming events
       2)see event details
       3)register for events with just a few clicks
        
      this helps user by removing long proceses for registring for the events
  5) Resources Page:
      We created a Resources page where session materials and useful content are properly organized instead of being scattered.
      It includes:
       1)organized resources
       2)categories for easier access
       3)search support
       4)access to past session material

      This profile page helps for users to manage their information and personalize their account details.

   6) Members Page:
      We also created a members page so users can connect with:
        1)current heads
        2)current members
        3)alumni and past leads of the club

      This helps to connect with any member of the club,let it be past or present.
-- > Admin Side
  We built a separate admin workspace to manage the website more effectively.

  The admin side is different from the normal user side and is meant for club management tasks.

  1) Admin Dashboard:
     the admin dashboard serves as the control center of the website.
  
  3) User Management:
    Admins can:  
      1)view all registered users  
      2)check user details  
      3)assign roles  
      4)promote a user to admin when needed
  
  #) Event Management:
    Admins can:  
      1)create events  
      2)edit events  
      3)delete events  
      4)view registrations for each event
  
  4) Resource Management:
    Admins can:
      1)add resources  
      2)manage resource categories  
      3)update resources  
      4)delete resources

Main Features of the Website are :
--> Public club website
--> Firebase-based authentication
--> Dedicated user dashboard
--> Events listing and registration
--> Resource management and search
--> User profile management
--> Members and alumni listing
--> Separate admin dashboard
--> Admin control over users, events, and resources

Tech Stack  
  1)Frontend:
    -> React
    -> TypeScript
    -> Vite
    -> Tailwind CSS
  2)Backend:
    -> FastAPI  
    -> Uvicorn
  3)Database:
    -> MySQL
  4)Authentication:
   -> Firebase Authentication

Project Structure:

- `frontend/` → React frontend
- `Backend_user/` → main backend routes and logic
- `Backend/` → schema and backend-related supporting files

Why We Built This:

We built this project because club-related data should not remain scattered across chats, random files, or temporary links.
A club like the Web Dev Cell needs a proper platform where:
  1)events can be tracked
  2)resources can be stored properly
  3)members can stay connected
  4)admins can manage everything from one place

Future Improvements whcih we were planning to add but could not do it are:
  1) Add a page for the user to view all the photos and all
  2) A chatbot for helping us throught out the website
  3) A inbuilt messaging portal for asking doubts by integrating such as gemini for clarification of doubts and all
  4) expand the now of items like the different varieties into the database.

Some improvements can still be added in the future, such as:
  1)better documentation  
  2)more testing and validation  
  3)further UI and performance improvements

Conclusion:

Instead of making just a static club website, I focused on building a complete working system with:
  1)authentication  
  2)user workflows  
  3)admin workflows
  4)event and resource management
  5)structured data handling

This project helped me understand how to design and manage a real full-stack product from start to finish.

