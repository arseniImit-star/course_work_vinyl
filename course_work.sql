-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1
-- Время создания: Май 29 2026 г., 08:14
-- Версия сервера: 10.4.32-MariaDB
-- Версия PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `course_work`
--

-- --------------------------------------------------------

--
-- Структура таблицы `cart_items`
--

CREATE TABLE `cart_items` (
  `id` bigint(20) NOT NULL,
  `quantity` int(11) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `vinyl_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `comments`
--

CREATE TABLE `comments` (
  `id` bigint(20) NOT NULL,
  `content` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `post_id` bigint(20) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `conversations`
--

CREATE TABLE `conversations` (
  `id` bigint(20) NOT NULL,
  `user1_id` bigint(20) NOT NULL,
  `user2_id` bigint(20) NOT NULL,
  `listing_id` bigint(20) DEFAULT NULL,
  `last_message` text DEFAULT NULL,
  `last_message_time` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `conversations`
--

INSERT INTO `conversations` (`id`, `user1_id`, `user2_id`, `listing_id`, `last_message`, `last_message_time`, `created_at`) VALUES
(1, 3, 2, NULL, 'Здравсвуйте,Наталья.', '2026-05-28 18:14:40', '2026-05-28 18:00:15');

-- --------------------------------------------------------

--
-- Структура таблицы `favorites`
--

CREATE TABLE `favorites` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `listing_id` bigint(20) NOT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `genre`
--

CREATE TABLE `genre` (
  `id` bigint(20) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `listings`
--

CREATE TABLE `listings` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `vinyl_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`vinyl_data`)),
  `type` enum('SALE','EXCHANGE','SEARCH','RECORD') NOT NULL,
  `price` decimal(38,2) DEFAULT NULL,
  `desired_records` text DEFAULT NULL,
  `status` enum('ACTIVE','SOLD','CLOSED') DEFAULT 'ACTIVE',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `listings`
--

INSERT INTO `listings` (`id`, `user_id`, `title`, `description`, `vinyl_data`, `type`, `price`, `desired_records`, `status`, `created_at`, `updated_at`) VALUES
(1, 2, 'Queen - Queen - Queen II', 'Супер', '{\"country\":\"US\",\"artist\":\"Queen\",\"year\":\"2008\",\"coverImage\":\"https://i.discogs.com/Gkdc0zbAQPvBLc69keJ1e4sn-HqpuCUKqtJBIuD5f-o/rs:fit/g:sm/q:90/h:300/w:300/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTMxMTA5/NTEtMTMyNDI0NjYy/Mi5wbmc.jpeg\",\"genre\":\"Rock\",\"format\":\"Vinyl\",\"id\":3110951,\"label\":\"Hollywood Records\",\"title\":\"Queen - Queen II\"}', 'RECORD', NULL, NULL, 'ACTIVE', '2026-05-28 15:34:02', NULL),
(2, 3, 'Frank Sinatra - Frank Sinatra - The Frank Sinatra Story', 'хорошее состояние', '{\"country\":\"US\",\"artist\":\"Frank Sinatra\",\"year\":\"1958\",\"coverImage\":\"https://i.discogs.com/N16LQ1zA1mvJdAyr8ib9zKlWKnEndQ0rLYIVP5GqKNU/rs:fit/g:sm/q:90/h:600/w:600/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTIzNjc1/MDctMTc0MjAxMjcw/NC0zODg3LmpwZWc.jpeg\",\"genre\":\"Jazz\",\"format\":\"Vinyl\",\"id\":2367507,\"label\":\"Columbia\",\"title\":\"Frank Sinatra - The Frank Sinatra Story\"}', 'SEARCH', NULL, NULL, 'ACTIVE', '2026-05-28 17:09:49', NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `listing_comments`
--

CREATE TABLE `listing_comments` (
  `id` bigint(20) NOT NULL,
  `listing_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `content` text NOT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `listing_comments`
--

INSERT INTO `listing_comments` (`id`, `listing_id`, `user_id`, `content`, `created_at`) VALUES
(1, 1, 1, 'вау', '2026-05-28 16:52:35'),
(2, 1, 1, 'классно)\n', '2026-05-28 16:55:59'),
(3, 1, 3, 'ХМ', '2026-05-28 16:57:16');

-- --------------------------------------------------------

--
-- Структура таблицы `loan_requests`
--

CREATE TABLE `loan_requests` (
  `id` bigint(20) NOT NULL,
  `loan_date` date DEFAULT NULL,
  `message` text DEFAULT NULL,
  `request_date` datetime(6) NOT NULL,
  `return_date` date DEFAULT NULL,
  `status` enum('APPROVED','CANCELLED','COMPLETED','PENDING','REJECTED') NOT NULL,
  `owner_id` bigint(20) NOT NULL,
  `requester_id` bigint(20) NOT NULL,
  `vinyl_record_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `messages`
--

CREATE TABLE `messages` (
  `id` bigint(20) NOT NULL,
  `conversation_id` bigint(20) NOT NULL,
  `sender_id` bigint(20) NOT NULL,
  `receiver_id` bigint(20) NOT NULL,
  `message` text NOT NULL,
  `photo_url` varchar(500) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` datetime NOT NULL,
  `listing_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `messages`
--

INSERT INTO `messages` (`id`, `conversation_id`, `sender_id`, `receiver_id`, `message`, `photo_url`, `is_read`, `created_at`, `listing_id`) VALUES
(1, 1, 3, 2, 'Привет', NULL, 1, '2026-05-28 18:00:20', NULL),
(2, 1, 2, 3, 'Здравсвуйте,Наталья.', NULL, 0, '2026-05-28 18:14:40', NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint(20) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `is_read` bit(1) DEFAULT NULL,
  `message` text NOT NULL,
  `related_id` bigint(20) DEFAULT NULL,
  `type` varchar(50) NOT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `orders`
--

CREATE TABLE `orders` (
  `id` bigint(20) NOT NULL,
  `order_date` datetime(6) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `total_amount` decimal(38,2) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `order_items`
--

CREATE TABLE `order_items` (
  `id` bigint(20) NOT NULL,
  `price` decimal(38,2) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `order_id` bigint(20) DEFAULT NULL,
  `vinyl_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `trade_requests`
--

CREATE TABLE `trade_requests` (
  `id` bigint(20) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `message` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `offered_vinyl_id` bigint(20) DEFAULT NULL,
  `receiver_id` bigint(20) DEFAULT NULL,
  `requested_vinyl_id` bigint(20) DEFAULT NULL,
  `requester_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `users`
--

CREATE TABLE `users` (
  `id` bigint(20) NOT NULL,
  `avatar_path` varchar(255) DEFAULT NULL,
  `bio` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `email` varchar(255) NOT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  `rating` double DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `username` varchar(255) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `avatar` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `users`
--

INSERT INTO `users` (`id`, `avatar_path`, `bio`, `city`, `created_at`, `email`, `first_name`, `last_name`, `password`, `phone_number`, `rating`, `role`, `username`, `address`, `phone`, `avatar`) VALUES
(1, NULL, '', 'Иркутcr', '2026-05-26 18:24:51.000000', 'arsenijklykov870@gmail.com', 'Klykov', 'Arseniy', '$2a$10$UiWYX54WvJv3nM3iZGQDtuDFrGAjkPMW2/MCAhKQnRXvT7zS68.AC', NULL, 0, 'USER', 'arsenimit6', NULL, NULL, NULL),
(2, NULL, NULL, 'Иркутск', '2026-05-28 05:49:25.000000', 'klykovarseny@mail.ru', 'Арсений', 'Клыков', '$2a$10$QCKpGCHSKK6sW.0Ol.yzoekzK0bfm9gdOk0ZBy9POX91f3hdwNGFG', NULL, 0, 'USER', 'ArsenInit', NULL, NULL, NULL),
(3, NULL, NULL, 'Иркутск', '2026-05-28 12:11:39.000000', 'nata@mail.ru', 'Наталья', 'Клыкова', '$2a$10$/RQ2.6hRJQwSPJzXn2F6ouMB1iLJIKrVGrrhVh8AcrgmI8kSD/aWS', NULL, 0, 'USER', 'nata', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `user_collection`
--

CREATE TABLE `user_collection` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `vinyl_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`vinyl_data`)),
  `added_date` datetime DEFAULT NULL,
  `user_rating` int(11) DEFAULT NULL,
  `user_comment` text DEFAULT NULL,
  `user_photos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`user_photos`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `user_collection`
--

INSERT INTO `user_collection` (`id`, `user_id`, `vinyl_data`, `added_date`, `user_rating`, `user_comment`, `user_photos`) VALUES
(1, 2, '{\"id\":11256175,\"title\":\"Taylor Swift - Reputation\",\"artist\":\"Taylor Swift\",\"year\":\"2017\",\"genre\":\"Electronic\",\"coverImage\":\"https://i.discogs.com/OZiVXOktigzIJtNgWS9KGrPbpcpBIeYrEL3WcmCsf3Y/rs:fit/g:sm/q:90/h:600/w:600/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTExMjU2/MTc1LTE1MTMzNzc4/OTktODYyNC5qcGVn.jpeg\",\"tracklist\":[]}', '2026-05-28 15:29:50', 0, NULL, NULL),
(2, 2, '{\"id\":2911293,\"title\":\"Michael Jackson - Thriller\",\"artist\":\"Michael Jackson\",\"year\":\"1982\",\"genre\":\"Funk / Soul\",\"coverImage\":\"https://i.discogs.com/OQRwID3TvI5bMrPxrDgtFRftYhjZlkQ1FPE81xPOY5I/rs:fit/g:sm/q:90/h:602/w:600/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTI5MTEy/OTMtMTU5NDI0NTgx/Mi03OTMxLmpwZWc.jpeg\",\"tracklist\":[{\"duration\":\"6:02\",\"position\":\"A1\",\"title\":\"Wanna Be Startin\' Somethin\'\"},{\"duration\":\"4:20\",\"position\":\"A2\",\"title\":\"Baby Be Mine\"},{\"duration\":\"3:42\",\"position\":\"A3\",\"title\":\"The Girl Is Mine\"},{\"duration\":\"5:57\",\"position\":\"A4\",\"title\":\"Thriller\"},{\"duration\":\"4:17\",\"position\":\"B1\",\"title\":\"Beat It\"},{\"duration\":\"4:57\",\"position\":\"B2\",\"title\":\"Billie Jean\"},{\"duration\":\"4:05\",\"position\":\"B3\",\"title\":\"Human Nature\"},{\"duration\":\"3:58\",\"position\":\"B4\",\"title\":\"P.Y.T. (Pretty Young Thing)\"},{\"duration\":\"4:57\",\"position\":\"B5\",\"title\":\"The Lady In My Life\"}]}', '2026-05-28 15:29:54', 0, NULL, NULL),
(3, 2, '{\"id\":4904158,\"title\":\"Arctic Monkeys - AM\",\"artist\":\"Arctic Monkeys\",\"year\":\"2013\",\"genre\":\"Rock\",\"coverImage\":\"https://i.discogs.com/MohCZfatquytAhecVgsR1eyVULp-kPT7ricg83wi0WE/rs:fit/g:sm/q:90/h:600/w:600/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTQ5MDQx/NTgtMTM3ODk5NDA1/My03MjEyLmpwZWc.jpeg\",\"tracklist\":[{\"duration\":\"4:32\",\"position\":\"A1\",\"title\":\"Do I Wanna Know?\"},{\"duration\":\"3:20\",\"position\":\"A2\",\"title\":\"R U Mine?\"},{\"duration\":\"3:26\",\"position\":\"A3\",\"title\":\"One For The Road\"},{\"duration\":\"3:27\",\"position\":\"A4\",\"title\":\"Arabella\"},{\"duration\":\"3:04\",\"position\":\"A5\",\"title\":\"I Want It All\"},{\"duration\":\"4:03\",\"position\":\"A6\",\"title\":\"No.1 Party Anthem\"},{\"duration\":\"3:35\",\"position\":\"B1\",\"title\":\"Mad Sounds\"},{\"duration\":\"3:01\",\"position\":\"B2\",\"title\":\"Fireside\"},{\"duration\":\"2:42\",\"position\":\"B3\",\"title\":\"Why\'d You Only Call Me When You\'re High?\"},{\"duration\":\"3:12\",\"position\":\"B4\",\"title\":\"Snap Out Of It \"},{\"duration\":\"4:17\",\"position\":\"B5\",\"title\":\"Knee Socks\"},{\"duration\":\"3:04\",\"position\":\"B6\",\"title\":\"I Wanna Be Yours\"}]}', '2026-05-28 15:29:58', 0, NULL, NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `vinyls`
--

CREATE TABLE `vinyls` (
  `id` bigint(20) NOT NULL,
  `artist` varchar(255) NOT NULL,
  `cover_image_url` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `price` decimal(38,2) DEFAULT NULL,
  `stock_quantity` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `year` int(11) DEFAULT NULL,
  `genre_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `vinyls`
--

INSERT INTO `vinyls` (`id`, `artist`, `cover_image_url`, `description`, `price`, `stock_quantity`, `title`, `year`, `genre_id`) VALUES
(1, 'The Beatles', NULL, NULL, 29.99, 10, 'Abbey Road', 1969, NULL),
(2, 'Pink Floyd', NULL, NULL, 34.99, 5, 'The Dark Side of the Moon', 1973, NULL),
(3, 'Michael Jackson', NULL, NULL, 24.99, 15, 'Thriller', 1982, NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `vinyl_photo`
--

CREATE TABLE `vinyl_photo` (
  `id` bigint(20) NOT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  `vinyl_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `vinyl_records`
--

CREATE TABLE `vinyl_records` (
  `id` bigint(20) NOT NULL,
  `added_at` datetime(6) NOT NULL,
  `album_title` varchar(200) NOT NULL,
  `artist` varchar(200) NOT NULL,
  `is_available_for_loan` bit(1) DEFAULT NULL,
  `cover_image_path` varchar(255) DEFAULT NULL,
  `cover_image_url` varchar(255) DEFAULT NULL,
  `discogs_id` bigint(20) DEFAULT NULL,
  `genre` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `purchase_date` date DEFAULT NULL,
  `purchase_price` decimal(38,2) DEFAULT NULL,
  `release_year` int(11) DEFAULT NULL,
  `sleeve_condition` enum('FAIR','GOOD','MINT','NEAR_MINT','POOR','VERY_GOOD','VERY_GOOD_PLUS') NOT NULL,
  `vinyl_condition` enum('FAIR','GOOD','MINT','NEAR_MINT','POOR','VERY_GOOD','VERY_GOOD_PLUS') NOT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK709eickf3kc0dujx3ub9i7btf` (`user_id`),
  ADD KEY `FKlt7a3dqubtw8p0fvlvtkaa96g` (`vinyl_id`);

--
-- Индексы таблицы `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK8omq0tc18jd43bu5tjh6jvraq` (`user_id`);

--
-- Индексы таблицы `conversations`
--
ALTER TABLE `conversations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_conversation` (`user1_id`,`user2_id`,`listing_id`),
  ADD KEY `FK_conversations_user1` (`user1_id`),
  ADD KEY `FK_conversations_user2` (`user2_id`),
  ADD KEY `FK_conversations_listing` (`listing_id`),
  ADD KEY `idx_conversations_user_last` (`user1_id`,`last_message_time`),
  ADD KEY `idx_conversations_user2_last` (`user2_id`,`last_message_time`);

--
-- Индексы таблицы `favorites`
--
ALTER TABLE `favorites`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_favorite` (`user_id`,`listing_id`),
  ADD KEY `FK_favorites_user` (`user_id`),
  ADD KEY `FK_favorites_listing` (`listing_id`);

--
-- Индексы таблицы `genre`
--
ALTER TABLE `genre`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `listings`
--
ALTER TABLE `listings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_listings_user` (`user_id`),
  ADD KEY `idx_listings_user_status` (`user_id`,`status`),
  ADD KEY `idx_listings_type` (`type`),
  ADD KEY `idx_listings_created` (`created_at`);

--
-- Индексы таблицы `listing_comments`
--
ALTER TABLE `listing_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_listing_comments_listing` (`listing_id`),
  ADD KEY `FK_listing_comments_user` (`user_id`);

--
-- Индексы таблицы `loan_requests`
--
ALTER TABLE `loan_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK3waqvbfnl6asq3v0asmbn4sv3` (`owner_id`),
  ADD KEY `FK8ktc36wwc5v7aitpq77niljxt` (`requester_id`),
  ADD KEY `FKrpolasvfak5bitvh04w2ft6m8` (`vinyl_record_id`);

--
-- Индексы таблицы `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_messages_conversation` (`conversation_id`),
  ADD KEY `FK_messages_sender` (`sender_id`),
  ADD KEY `FK_messages_receiver` (`receiver_id`),
  ADD KEY `idx_messages_conversation_created` (`conversation_id`,`created_at`),
  ADD KEY `FKq4pvtu9s5dw5igbibathqr8ea` (`listing_id`);

--
-- Индексы таблицы `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK9y21adhxn0ayjhfocscqox7bh` (`user_id`);

--
-- Индексы таблицы `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK32ql8ubntj5uh44ph9659tiih` (`user_id`);

--
-- Индексы таблицы `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKbioxgbv59vetrxe0ejfubep1w` (`order_id`),
  ADD KEY `FK5bx7fsxkp0gls4wckmidfas82` (`vinyl_id`);

--
-- Индексы таблицы `trade_requests`
--
ALTER TABLE `trade_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKnttuy0v562oykqitc1v7ntj4c` (`offered_vinyl_id`),
  ADD KEY `FK5w33rjc2aw6o7vc3nrljy593g` (`receiver_id`),
  ADD KEY `FKse3ts1bewks60ggr2h0fxdivu` (`requested_vinyl_id`),
  ADD KEY `FK5gg43tvgwovo9r0cmq7i9r2uk` (`requester_id`);

--
-- Индексы таблицы `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK_6dotkott2kjsp8vw4d0m25fb7` (`email`),
  ADD UNIQUE KEY `UK_r43af9ap4edm43mmtq01oddj6` (`username`);

--
-- Индексы таблицы `user_collection`
--
ALTER TABLE `user_collection`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_user_collection_user` (`user_id`);

--
-- Индексы таблицы `vinyls`
--
ALTER TABLE `vinyls`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKmd5kvx7huvgwv2qolroe5y44l` (`genre_id`);

--
-- Индексы таблицы `vinyl_photo`
--
ALTER TABLE `vinyl_photo`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKtngvt4aitiuk5b4l7p174w11b` (`vinyl_id`);

--
-- Индексы таблицы `vinyl_records`
--
ALTER TABLE `vinyl_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKatv9bostwu3gbv4o86fjs09og` (`user_id`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `comments`
--
ALTER TABLE `comments`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `conversations`
--
ALTER TABLE `conversations`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT для таблицы `favorites`
--
ALTER TABLE `favorites`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `genre`
--
ALTER TABLE `genre`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `listings`
--
ALTER TABLE `listings`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT для таблицы `listing_comments`
--
ALTER TABLE `listing_comments`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT для таблицы `loan_requests`
--
ALTER TABLE `loan_requests`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `messages`
--
ALTER TABLE `messages`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT для таблицы `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `trade_requests`
--
ALTER TABLE `trade_requests`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT для таблицы `user_collection`
--
ALTER TABLE `user_collection`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT для таблицы `vinyls`
--
ALTER TABLE `vinyls`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT для таблицы `vinyl_photo`
--
ALTER TABLE `vinyl_photo`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `vinyl_records`
--
ALTER TABLE `vinyl_records`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `FK709eickf3kc0dujx3ub9i7btf` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FKlt7a3dqubtw8p0fvlvtkaa96g` FOREIGN KEY (`vinyl_id`) REFERENCES `vinyls` (`id`);

--
-- Ограничения внешнего ключа таблицы `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `FK8omq0tc18jd43bu5tjh6jvraq` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Ограничения внешнего ключа таблицы `conversations`
--
ALTER TABLE `conversations`
  ADD CONSTRAINT `FK_conversations_listing` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `FK_conversations_user1` FOREIGN KEY (`user1_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_conversations_user2` FOREIGN KEY (`user2_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `favorites`
--
ALTER TABLE `favorites`
  ADD CONSTRAINT `FK_favorites_listing` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_favorites_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `listings`
--
ALTER TABLE `listings`
  ADD CONSTRAINT `FK_listings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `listing_comments`
--
ALTER TABLE `listing_comments`
  ADD CONSTRAINT `FK_listing_comments_listing` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_listing_comments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `loan_requests`
--
ALTER TABLE `loan_requests`
  ADD CONSTRAINT `FK3waqvbfnl6asq3v0asmbn4sv3` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FK8ktc36wwc5v7aitpq77niljxt` FOREIGN KEY (`requester_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FKrpolasvfak5bitvh04w2ft6m8` FOREIGN KEY (`vinyl_record_id`) REFERENCES `vinyl_records` (`id`);

--
-- Ограничения внешнего ключа таблицы `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `FK_messages_conversation` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_messages_receiver` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_messages_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FKq4pvtu9s5dw5igbibathqr8ea` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`);

--
-- Ограничения внешнего ключа таблицы `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `FK9y21adhxn0ayjhfocscqox7bh` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Ограничения внешнего ключа таблицы `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `FK32ql8ubntj5uh44ph9659tiih` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Ограничения внешнего ключа таблицы `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `FK5bx7fsxkp0gls4wckmidfas82` FOREIGN KEY (`vinyl_id`) REFERENCES `vinyls` (`id`),
  ADD CONSTRAINT `FKbioxgbv59vetrxe0ejfubep1w` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`);

--
-- Ограничения внешнего ключа таблицы `trade_requests`
--
ALTER TABLE `trade_requests`
  ADD CONSTRAINT `FK5gg43tvgwovo9r0cmq7i9r2uk` FOREIGN KEY (`requester_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FK5w33rjc2aw6o7vc3nrljy593g` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FKnttuy0v562oykqitc1v7ntj4c` FOREIGN KEY (`offered_vinyl_id`) REFERENCES `vinyls` (`id`),
  ADD CONSTRAINT `FKse3ts1bewks60ggr2h0fxdivu` FOREIGN KEY (`requested_vinyl_id`) REFERENCES `vinyls` (`id`);

--
-- Ограничения внешнего ключа таблицы `user_collection`
--
ALTER TABLE `user_collection`
  ADD CONSTRAINT `FK_user_collection_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `vinyls`
--
ALTER TABLE `vinyls`
  ADD CONSTRAINT `FKmd5kvx7huvgwv2qolroe5y44l` FOREIGN KEY (`genre_id`) REFERENCES `genre` (`id`);

--
-- Ограничения внешнего ключа таблицы `vinyl_photo`
--
ALTER TABLE `vinyl_photo`
  ADD CONSTRAINT `FKtngvt4aitiuk5b4l7p174w11b` FOREIGN KEY (`vinyl_id`) REFERENCES `vinyls` (`id`);

--
-- Ограничения внешнего ключа таблицы `vinyl_records`
--
ALTER TABLE `vinyl_records`
  ADD CONSTRAINT `FKatv9bostwu3gbv4o86fjs09og` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
