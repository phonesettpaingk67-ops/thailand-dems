-- Thailand Locations Reference Database
-- Major cities, provinces, universities, landmarks, and districts

CREATE TABLE IF NOT EXISTS ThailandLocations (
  LocationID INT PRIMARY KEY AUTO_INCREMENT,
  LocationName VARCHAR(200) NOT NULL,
  LocationType ENUM('Province', 'District', 'City', 'University', 'Landmark', 'Airport', 'Hospital', 'Government') NOT NULL,
  Province VARCHAR(100),
  Region ENUM('Northern', 'Northeastern', 'Central', 'Eastern', 'Western', 'Southern') NOT NULL,
  Latitude DECIMAL(10, 8) NOT NULL,
  Longitude DECIMAL(11, 8) NOT NULL,
  Address TEXT,
  PostalCode VARCHAR(10),
  Population INT,
  IsActive BOOLEAN DEFAULT TRUE,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name (LocationName),
  INDEX idx_type (LocationType),
  INDEX idx_province (Province),
  INDEX idx_region (Region)
);

-- Insert Major Provinces and Cities
INSERT INTO ThailandLocations (LocationName, LocationType, Province, Region, Latitude, Longitude, Address, Population) VALUES
-- Bangkok and Metropolitan
('Bangkok Metropolitan', 'Province', 'Bangkok', 'Central', 13.7563, 100.5018, 'Bangkok, Thailand', 10539000),
('Nonthaburi', 'Province', 'Nonthaburi', 'Central', 13.8621, 100.5144, 'Nonthaburi, Thailand', 1260000),
('Pathum Thani', 'Province', 'Pathum Thani', 'Central', 14.0208, 100.5250, 'Pathum Thani, Thailand', 1145000),
('Samut Prakan', 'Province', 'Samut Prakan', 'Central', 13.5991, 100.5998, 'Samut Prakan, Thailand', 1357000),

-- Northern Thailand
('Chiang Mai', 'Province', 'Chiang Mai', 'Northern', 18.7883, 98.9853, 'Chiang Mai, Thailand', 1781000),
('Chiang Rai', 'Province', 'Chiang Rai', 'Northern', 19.9105, 99.8406, 'Chiang Rai, Thailand', 1309000),
('Lampang', 'Province', 'Lampang', 'Northern', 18.2888, 99.4912, 'Lampang, Thailand', 750000),
('Lamphun', 'Province', 'Lamphun', 'Northern', 18.5744, 99.0087, 'Lamphun, Thailand', 405000),
('Mae Hong Son', 'Province', 'Mae Hong Son', 'Northern', 19.3030, 97.9655, 'Mae Hong Son, Thailand', 247000),

-- Northeastern Thailand (Isan)
('Nakhon Ratchasima (Korat)', 'Province', 'Nakhon Ratchasima', 'Northeastern', 14.9799, 102.0977, 'Nakhon Ratchasima, Thailand', 2634000),
('Udon Thani', 'Province', 'Udon Thani', 'Northeastern', 17.4138, 102.7877, 'Udon Thani, Thailand', 1575000),
('Khon Kaen', 'Province', 'Khon Kaen', 'Northeastern', 16.4322, 102.8236, 'Khon Kaen, Thailand', 1800000),
('Ubon Ratchathani', 'Province', 'Ubon Ratchathani', 'Northeastern', 15.2286, 104.8560, 'Ubon Ratchathani, Thailand', 1860000),

-- Central Thailand
('Ayutthaya', 'Province', 'Phra Nakhon Si Ayutthaya', 'Central', 14.3532, 100.5771, 'Ayutthaya, Thailand', 810000),
('Lopburi', 'Province', 'Lopburi', 'Central', 14.7995, 100.6534, 'Lopburi, Thailand', 754000),
('Nakhon Pathom', 'Province', 'Nakhon Pathom', 'Central', 13.8199, 100.0378, 'Nakhon Pathom, Thailand', 905000),
('Suphan Buri', 'Province', 'Suphan Buri', 'Central', 14.4745, 100.1173, 'Suphan Buri, Thailand', 849000),

-- Eastern Thailand
('Chonburi', 'Province', 'Chonburi', 'Eastern', 13.3611, 100.9847, 'Chonburi, Thailand', 1581000),
('Rayong', 'Province', 'Rayong', 'Eastern', 12.6814, 101.2816, 'Rayong, Thailand', 713000),
('Pattaya', 'City', 'Chonburi', 'Eastern', 12.9279, 100.8772, 'Pattaya, Chonburi, Thailand', 120000),
('Chanthaburi', 'Province', 'Chanthaburi', 'Eastern', 12.6113, 102.1039, 'Chanthaburi, Thailand', 533000),

-- Western Thailand
('Kanchanaburi', 'Province', 'Kanchanaburi', 'Western', 14.0228, 99.5328, 'Kanchanaburi, Thailand', 857000),
('Ratchaburi', 'Province', 'Ratchaburi', 'Western', 13.5282, 99.8133, 'Ratchaburi, Thailand', 853000),

-- Southern Thailand
('Phuket', 'Province', 'Phuket', 'Southern', 7.8804, 98.3923, 'Phuket, Thailand', 416000),
('Surat Thani', 'Province', 'Surat Thani', 'Southern', 9.1382, 99.3331, 'Surat Thani, Thailand', 1071000),
('Krabi', 'Province', 'Krabi', 'Southern', 8.0863, 98.9063, 'Krabi, Thailand', 478000),
('Songkhla', 'Province', 'Songkhla', 'Southern', 7.1756, 100.6140, 'Songkhla, Thailand', 1426000),
('Nakhon Si Thammarat', 'Province', 'Nakhon Si Thammarat', 'Southern', 8.4304, 99.9631, 'Nakhon Si Thammarat, Thailand', 1558000);

-- Universities
INSERT INTO ThailandLocations (LocationName, LocationType, Province, Region, Latitude, Longitude, Address) VALUES
('Chulalongkorn University', 'University', 'Bangkok', 'Central', 13.7367, 100.5330, '254 Phayathai Rd, Pathumwan, Bangkok 10330'),
('Thammasat University (Rangsit)', 'University', 'Pathum Thani', 'Central', 14.0734, 100.6050, '99 Moo 18 Paholyothin Rd, Khlong Luang, Pathum Thani 12120'),
('Thammasat University (Tha Phra Chan)', 'University', 'Bangkok', 'Central', 13.7544, 100.4925, '2 Prachan Rd, Phra Nakhon, Bangkok 10200'),
('Rangsit University', 'University', 'Pathum Thani', 'Central', 13.9763, 100.5897, '52/347 Muang-Ake, Phaholyothin Rd, Lak Hok, Pathum Thani 12000'),
('Kasetsart University', 'University', 'Bangkok', 'Central', 13.8467, 100.5717, '50 Ngamwongwan Rd, Lat Yao, Chatuchak, Bangkok 10900'),
('Mahidol University (Salaya)', 'University', 'Nakhon Pathom', 'Central', 13.7946, 100.3234, '999 Phutthamonthon 4 Rd, Salaya, Nakhon Pathom 73170'),
('Chiang Mai University', 'University', 'Chiang Mai', 'Northern', 18.8060, 98.9511, '239 Huay Kaew Rd, Suthep, Mueang Chiang Mai, Chiang Mai 50200'),
('Khon Kaen University', 'University', 'Khon Kaen', 'Northeastern', 16.4711, 102.8237, '123 Mittraphap Rd, Nai Mueang, Khon Kaen 40002'),
('Prince of Songkla University', 'University', 'Songkhla', 'Southern', 7.0089, 100.5023, '15 Kanjanavanich Rd, Hat Yai, Songkhla 90110'),
('Silpakorn University', 'University', 'Nakhon Pathom', 'Central', 13.8201, 100.0406, '31 Na Phra Lan Rd, Phra Nakhon, Bangkok 10200');

-- Major Landmarks and Tourist Sites
INSERT INTO ThailandLocations (LocationName, LocationType, Province, Region, Latitude, Longitude, Address) VALUES
('Grand Palace', 'Landmark', 'Bangkok', 'Central', 13.7500, 100.4915, 'Na Phra Lan Rd, Phra Nakhon, Bangkok 10200'),
('Wat Phra Kaew', 'Landmark', 'Bangkok', 'Central', 13.7515, 100.4924, 'Na Phra Lan Rd, Phra Nakhon, Bangkok 10200'),
('Wat Arun', 'Landmark', 'Bangkok', 'Central', 13.7437, 100.4887, '158 Thanon Wang Doem, Wat Arun, Bangkok Yai, Bangkok 10600'),
('Chatuchak Weekend Market', 'Landmark', 'Bangkok', 'Central', 13.7998, 100.5500, 'Kamphaeng Phet 2 Rd, Chatuchak, Bangkok 10900'),
('Ayutthaya Historical Park', 'Landmark', 'Phra Nakhon Si Ayutthaya', 'Central', 14.3532, 100.5771, 'Ayutthaya, Thailand 13000'),
('Doi Suthep Temple', 'Landmark', 'Chiang Mai', 'Northern', 18.8047, 98.9216, 'Sriwichai Alley, Su Thep, Mueang Chiang Mai, Chiang Mai 50200'),
('Phi Phi Islands', 'Landmark', 'Krabi', 'Southern', 7.7407, 98.7784, 'Phi Phi Islands, Krabi, Thailand'),
('Railay Beach', 'Landmark', 'Krabi', 'Southern', 8.0114, 98.8397, 'Railay Beach, Ao Nang, Krabi 81000'),
('Erawan Waterfall', 'Landmark', 'Kanchanaburi', 'Western', 14.3714, 99.1431, 'Erawan National Park, Kanchanaburi, Thailand');

-- Major Airports
INSERT INTO ThailandLocations (LocationName, LocationType, Province, Region, Latitude, Longitude, Address) VALUES
('Suvarnabhumi Airport', 'Airport', 'Samut Prakan', 'Central', 13.6900, 100.7501, '999 Moo 1, Bang Phli, Samut Prakan 10540'),
('Don Mueang International Airport', 'Airport', 'Bangkok', 'Central', 13.9126, 100.6070, '222 Vibhavadi Rangsit Rd, Sanambin, Don Mueang, Bangkok 10210'),
('Chiang Mai International Airport', 'Airport', 'Chiang Mai', 'Northern', 18.7668, 98.9628, '60 Mahidol Rd, Tambon Su Thep, Mueang Chiang Mai, Chiang Mai 50200'),
('Phuket International Airport', 'Airport', 'Phuket', 'Southern', 8.1132, 98.3169, 'Mai Khao, Thalang, Phuket 83110'),
('Hat Yai International Airport', 'Airport', 'Songkhla', 'Southern', 6.9331, 100.3928, 'Tambon Khlong La, Hat Yai, Songkhla 90115');

-- Major Hospitals
INSERT INTO ThailandLocations (LocationName, LocationType, Province, Region, Latitude, Longitude, Address) VALUES
('Siriraj Hospital', 'Hospital', 'Bangkok', 'Central', 13.7575, 100.4867, '2 Wang Lang Rd, Siriraj, Bangkok Noi, Bangkok 10700'),
('Ramathibodi Hospital', 'Hospital', 'Bangkok', 'Central', 13.7595, 100.5262, '270 Rama VI Rd, Thung Phaya Thai, Ratchathewi, Bangkok 10400'),
('Bumrungrad Hospital', 'Hospital', 'Bangkok', 'Central', 13.7442, 100.5608, '33 Sukhumvit 3, Wattana, Bangkok 10110'),
('Bangkok Hospital', 'Hospital', 'Bangkok', 'Central', 13.7285, 100.5644, '2 Soi Soonvijai 7, New Petchburi Rd, Bangkok 10310'),
('Chiang Mai Ram Hospital', 'Hospital', 'Chiang Mai', 'Northern', 18.7954, 98.9845, '8 Bunrueang Rit Rd, Tambon Si Phum, Chiang Mai 50200');

-- Government Buildings
INSERT INTO ThailandLocations (LocationName, LocationType, Province, Region, Latitude, Longitude, Address) VALUES
('Government House', 'Government', 'Bangkok', 'Central', 13.7727, 100.5070, 'Phitsanulok Rd, Dusit, Bangkok 10300'),
('Parliament House', 'Government', 'Bangkok', 'Central', 13.7747, 100.5117, 'Uthong Nai Rd, Dusit, Bangkok 10300'),
('Ministry of Interior', 'Government', 'Bangkok', 'Central', 13.7693, 100.5135, 'Atsadang Rd, Phra Nakhon, Bangkok 10200'),
('Bangkok City Hall', 'Government', 'Bangkok', 'Central', 13.7280, 100.5138, 'Din So Rd, Phra Nakhon, Bangkok 10200');

-- Popular Districts in Bangkok
INSERT INTO ThailandLocations (LocationName, LocationType, Province, Region, Latitude, Longitude, Address) VALUES
('Sukhumvit', 'District', 'Bangkok', 'Central', 13.7363, 100.5730, 'Sukhumvit Rd, Bangkok, Thailand'),
('Silom', 'District', 'Bangkok', 'Central', 13.7291, 100.5248, 'Silom Rd, Bang Rak, Bangkok, Thailand'),
('Siam', 'District', 'Bangkok', 'Central', 13.7465, 100.5345, 'Rama I Rd, Pathum Wan, Bangkok, Thailand'),
('Ratchada', 'District', 'Bangkok', 'Central', 13.7608, 100.5683, 'Ratchadaphisek Rd, Bangkok, Thailand'),
('Thonglor', 'District', 'Bangkok', 'Central', 13.7324, 100.5831, 'Thong Lo Rd, Khlong Tan Nuea, Watthana, Bangkok'),
('Ekkamai', 'District', 'Bangkok', 'Central', 13.7194, 100.5849, 'Sukhumvit 63, Phra Khanong Nuea, Watthana, Bangkok');
