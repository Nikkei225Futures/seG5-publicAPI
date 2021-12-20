insert into auth_token (token_id, token_issuer_id, token_permission, expiry) values ('33ff2025-7a36-2418-b406-42a883194db8', 0, 'user', 1639901943);
insert into auth_token (token_id, token_issuer_id, token_permission, expiry) values ('33ff2025-7a36-2418-b406-42a883194db9', 0, 'restaurant', 1639901943);
insert into auth_token (token_id, token_issuer_id, token_permission, expiry) values ('33ff2025-7a36-2418-b406-42a883194db0', 0, 'admin', 1639901943);

insert into user (user_id, user_name, birthday, gender, email_addr, address, password, num_vicious_cancels) values (0, 'testUser', '2000/01/01', 'male', 'example@example.com', 'United States', 'testPassword', 0);
insert into user (user_id, user_name, birthday, gender, email_addr, address, password, num_vicious_cancels) values (1, 'testUser1', '2000/12/31', 'female', 'example@example.com', 'Japan', 'testPassword1', 0);
insert into user (user_id, user_name, birthday, gender, email_addr, address, password, num_vicious_cancels) values (2, 'testUser2', '2000/06/15', 'male', 'example@example.com', 'China', 'testPassworder', 0);

insert into restaurant(restaurant_id, restaurant_name, password, email_addr, address, time_open, time_close, holidays_json, features) values (0, 'testRestaurant', 'testPass', 'example@abc.com', 'Japan', '06:00', '18:00', '{["2021/12/31", "2022/01/01"]}', 'tasty');
insert into restaurant(restaurant_id, restaurant_name, password, email_addr, address, time_open, time_close, holidays_json, features) values (1, 'testRestaurant1', 'testPass1', 'example@abcdefg.com', 'China', '10:00', '21:00', '{["2021/12/03", "2022/01/05"]}', 'not so tasty');
insert into restaurant(restaurant_id, restaurant_name, password, email_addr, address, time_open, time_close, holidays_json, features) values (2, 'testRestaurant2', 'testPass2', 'example@abg.com', 'United States', '18:00', '03:00', '{["2021/12/03", "2022/01/05"]}', 'bit tasty');

insert into administrator(admin_id, admin_name, birthday, password, gender, address, email_addr) values (0, 'testAdmin', '2000/02/01', 'password', 'female', 'United States', 'admin@admin.com');
insert into administrator(admin_id, admin_name, birthday, password, gender, address, email_addr) values (1, 'testAdmin1', '2000/02/11', 'password1', 'male', 'China', 'admin1@admin.com');
insert into administrator(admin_id, admin_name, birthday, password, gender, address, email_addr) values (2, 'testAdmin2', '2000/02/21', 'password2', 'female', 'England', 'admin2@admin.com');

insert into seat(seat_id, seat_name, restaurant_id, capacity, is_filled, time_start, staying_times_json, avg_stay_time, feature) values (0, 'a-counter', 0, 1, 0, 0, '{["00:30:00", "00:35:00", "01:00:00", "01:30:00"]}', '00:53:45', 'counter');
insert into seat(seat_id, seat_name, restaurant_id, capacity, is_filled, time_start, staying_times_json, avg_stay_time, feature) values (1, 'b-table', 0, 3, 1, 1639901943, '{["00:30:00", "00:35:00", "01:00:00", "01:30:00"]}', '00:53:45', 'near a door');
insert into seat(seat_id, seat_name, restaurant_id, capacity, is_filled, time_start, staying_times_json, avg_stay_time, feature) values (2, 'c-table', 0, 5, 0, 0, '{["00:30:00", "00:35:00", "01:00:00", "01:30:00"]}', '00:53:45', 'near a window');

insert into seat(seat_id, seat_name, restaurant_id, capacity, is_filled, time_start, staying_times_json, avg_stay_time, feature) values (3, 'a-counter', 1, 1, 1, 1639901943, '{["00:30:00", "00:35:00", "01:00:00", "01:30:00"]}', '00:53:45', 'counter');
insert into seat(seat_id, seat_name, restaurant_id, capacity, is_filled, time_start, staying_times_json, avg_stay_time, feature) values (4, 'b-table', 1, 3, 1, 1639901943, '{["00:30:00", "00:35:00", "01:00:00", "01:30:00"]}', '00:53:45', 'near a door');
insert into seat(seat_id, seat_name, restaurant_id, capacity, is_filled, time_start, staying_times_json, avg_stay_time, feature) values (5, 'c-table', 1, 5, 0, 0, '{["00:30:00", "00:35:00", "01:00:00", "01:30:00"]}', '00:53:45', 'near a window');

insert into seat(seat_id, seat_name, restaurant_id, capacity, is_filled, time_start, staying_times_json, avg_stay_time, feature) values (6, 'a-table', 2, 5, 0, 0, '{["00:30:00", "00:35:00", "01:00:00", "01:30:00"]}', '00:53:45', 'counter');
insert into seat(seat_id, seat_name, restaurant_id, capacity, is_filled, time_start, staying_times_json, avg_stay_time, feature) values (7, 'b-counter', 2, 1, 1, 1639901943, '{["00:30:00", "00:35:00", "01:00:00", "01:30:00"]}', '00:53:45', 'near a door');
insert into seat(seat_id, seat_name, restaurant_id, capacity, is_filled, time_start, staying_times_json, avg_stay_time, feature) values (8, 'c-table', 2, 10, 0, 0, '{["00:30:00", "00:35:00", "01:00:00", "01:30:00"]}', '00:53:45', 'near a window');

insert into restaurant_evaluation(evaluation_id, restaurant_id, user_id, evaluation_grade, evaluation_comment) values (0, 0, 0, 2, 'not so tasty');
insert into restaurant_evaluation(evaluation_id, restaurant_id, user_id, evaluation_grade, evaluation_comment) values (1, 0, 1, 3, 'bit tasty');
insert into restaurant_evaluation(evaluation_id, restaurant_id, user_id, evaluation_grade, evaluation_comment) values (2, 0, 2, 4, 'tasty');
insert into restaurant_evaluation(evaluation_id, restaurant_id, user_id, evaluation_grade, evaluation_comment) values (3, 1, 0, 5, 'really tasty');
insert into restaurant_evaluation(evaluation_id, restaurant_id, user_id, evaluation_grade, evaluation_comment) values (4, 1, 2, 0, 'almost rubbish');
insert into restaurant_evaluation(evaluation_id, restaurant_id, user_id, evaluation_grade, evaluation_comment) values (5, 1, 1, 1, 'abcdefg');
insert into restaurant_evaluation(evaluation_id, restaurant_id, user_id, evaluation_grade, evaluation_comment) values (6, 2, 2, 2, 'not so tasty');
insert into restaurant_evaluation(evaluation_id, restaurant_id, user_id, evaluation_grade, evaluation_comment) values (7, 2, 1, 3, 'soso');
insert into restaurant_evaluation(evaluation_id, restaurant_id, user_id, evaluation_grade, evaluation_comment) values (8, 2, 0, 2, 'not so tasty');

insert into reservation(reservation_id, restaurant_id, user_id, seat_id, time_start, time_end, num_people, is_expired) values (0, 0, 0, 0, 1639900943, 1639901943, 1, 0);
insert into reservation(reservation_id, restaurant_id, user_id, seat_id, time_start, time_end, num_people, is_expired) values (1, 0, 0, 1, 1639900943, 1639901943, 2, 1);
insert into reservation(reservation_id, restaurant_id, user_id, seat_id, time_start, time_end, num_people, is_expired) values (2, 0, 0, 2, 1639900943, 1639901943, 3, 0);
insert into reservation(reservation_id, restaurant_id, user_id, seat_id, time_start, time_end, num_people, is_expired) values (3, 1, 1, 3, 1639900943, 1639901943, 4, 0);
insert into reservation(reservation_id, restaurant_id, user_id, seat_id, time_start, time_end, num_people, is_expired) values (4, 1, 1, 4, 1639900943, 1639901943, 5, 1);
insert into reservation(reservation_id, restaurant_id, user_id, seat_id, time_start, time_end, num_people, is_expired) values (5, 1, 1, 5, 1639900943, 1639901943, 6, 0);
insert into reservation(reservation_id, restaurant_id, user_id, seat_id, time_start, time_end, num_people, is_expired) values (6, 2, 2, 6, 1639900943, 1639901943, 7, 2);
insert into reservation(reservation_id, restaurant_id, user_id, seat_id, time_start, time_end, num_people, is_expired) values (7, 2, 2, 7, 1639900943, 1639901943, 8, 3);
insert into reservation(reservation_id, restaurant_id, user_id, seat_id, time_start, time_end, num_people, is_expired) values (8, 2, 2, 8, 1639900943, 1639901943, 9, 0);