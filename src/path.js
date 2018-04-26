/*
SCHEME:

- First room

- First subpassage

- First subroom

- Main lane - inner profile

- Main lane - outer profile

- Hall profile 

- First hall passage

- Second hall passage

- First hall room 

- Second hall room

- Left central room 

- First bottom room 

- Second bottom room 

- Third bottom room

- First right center room 

- Second right center room 

- Boss Room 
*/


export const walls = new Path2D(`
   
   M50 50               
   h 40 v 60 h -20
   M50 110 
   h -20 v -60 h 10
   
   v -25 h 30 
   M50 50
   v-15 h 20

   v 10 h 20 v -20 h -20
   
   M70 110 
   v 10 h 40
   M110 130
   h -70 v 50 h 10
   M50 190 
   h -10 v 30 h 50
   M160 220
   h 50 v -15 h -10
   M200 195
   h 10 v -40 h -10
   M200 145
   h 10 v -15 h -100
   
   M50 110
   v 10 h -20 v 110
   M70 230
   h 30
   M150 230
   h 30 
   M220 230
   v -110

   M110 120 
   v -70 h 25 
   M150 50
   h 40
   M205 50 
   h 15 v 70

   M135 50
   v -10
   M150 40
   v 10

   M205 40
   v 10
   M190 50
   v -10
   
   h -20 v -20 h 50 v 20 h -15

   M135 40
   h -20 v -20 h 50 v 20 h -15

   M50 190
   v 20 h 30 v -60 h -30 v 30

   M30 230 
   v 60 h 40 v -60

   M100 230
   v 60 h 50 v -60

   M180 230 
   v 60 h 40 v -60

   M200 205
   v 10 h -30 v -30 h 30 v 10

   M200 155
   v 20 h -30 v -40 h 30 v 10

   M90 220
   v -80 h 70 v 80
   `);
