export const INITIAL_PLANS = [
  {
    id: "1-month",
    name: "1 Month",
    category: "Foundation",
    price: 1499,
    period: "month",
    features: [
      "Full Gym Access",
      "Locker Access",
      "Strength & Cardio Equipment"
    ],
    disabledFeatures: [
      "Personal Training Coach",
      "Customized Diet Plan"
    ]
  },
  {
    id: "3-months",
    name: "3 Months",
    category: "Performance",
    price: 3999,
    period: "3 months",
    features: [
      "Full Gym Access",
      "Locker Access",
      "Strength & Cardio Equipment",
      "General Trainer Support"
    ],
    disabledFeatures: [
      "Personal Training Coach"
    ],
    mostPopular: true
  },
  {
    id: "6-months",
    name: "6 Months",
    category: "Elite",
    price: 6999,
    period: "6 months",
    features: [
      "Full Gym Access",
      "Locker Access",
      "Strength & Cardio Equipment",
      "General Trainer Support",
      "Body Assessment Sessions"
    ],
    disabledFeatures: [
      "Personal Training Coach"
    ]
  },
  {
    id: "12-months",
    name: "12 Months",
    category: "Ultimate",
    price: 10999,
    period: "year",
    features: [
      "Full Gym Access",
      "Locker Access",
      "Strength & Cardio Equipment",
      "General Trainer Support",
      "Body Assessment Sessions",
      "Free in.fit Shaker Bottle"
    ],
    disabledFeatures: []
  },
  {
    id: "personal-training",
    name: "Personal Training",
    category: "1-on-1",
    price: 5999,
    period: "month",
    features: [
      "Certified Elite Coach Gym Session",
      "Customized Workout Architecture",
      "Daily Progress Tracking & Motivation",
      "Strength & Cardio Equipment Included"
    ],
    disabledFeatures: []
  }
];
export const INITIAL_CLASSES = [
  {
    id: "class-1",
    name: "Elite Core Strength",
    category: "Strength",
    time: "06:00 AM - 07:00 AM",
    duration: "60 mins",
    trainer: "Rohit Sharma",
    spots: 20,
    bookedSpots: 14,
    description: "High-intensity compound lifts focusing on barbell and dumbbell mechanics with ergonomic precision."
  },
  {
    id: "class-2",
    name: "Precision Cardio Burn",
    category: "Cardio",
    time: "08:00 AM - 09:00 AM",
    duration: "60 mins",
    trainer: "Aditi Rao",
    spots: 25,
    bookedSpots: 19,
    description: "Interval-based zone-specific metabolic conditioning designed to maximize caloric expenditure."
  },
  {
    id: "class-3",
    name: "Kinetic Mobility Flow",
    category: "Yoga",
    time: "10:00 AM - 11:00 AM",
    duration: "60 mins",
    trainer: "Meera Deshmukh",
    spots: 15,
    bookedSpots: 8,
    description: "A deep active stretching flow class dedicated to joint health, spinal decompression, and athletic recovery."
  },
  {
    id: "class-4",
    name: "Power CrossFit Metcon",
    category: "CrossFit",
    time: "05:30 PM - 06:45 PM",
    duration: "75 mins",
    trainer: "Karan Kundra",
    spots: 18,
    bookedSpots: 15,
    description: "A high-energy metropolitan workout of the day incorporating poly-metrics, gymnastics, and fast lifting."
  },
  {
    id: "class-5",
    name: "Iron Mastery Powerlifting",
    category: "Strength",
    time: "07:00 PM - 08:30 PM",
    duration: "90 mins",
    trainer: "Rohit Sharma",
    spots: 12,
    bookedSpots: 9,
    description: "Learn raw powerlifting setups, low bar positioning, deadlift bracing patterns, and heavy bench press arches."
  }
];
export const TRAINERS = [
  {
    id: "trainer-rohit",
    name: "Rohit Sharma",
    specialty: "Powerlifting & Biomechanics",
    experience: "8+ Years Competitive lifting",
    certifications: ["NASM-PES", "Squat University Specialist", "ISSA Strength"],
    bio: "Champion powerlifter specializing in joint-friendly ergonomic strength setups and heavy bar acceleration mechanics.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDqULpIpNiDmzC1x3IQUokQW8tElAiISsxvngnk5ksQpkIPFOq-_qiBba-uQOXq-bz5q3UhG6snqMFEAvlNMNXwhsSk5xxDxQDJ0SqADZ-0JSCRuqoXxX5zSADr6JltVipfDDGV4qTDj8bCZySJAK6GF22w4aBWhIuerl03s3w62wdGX-sLeuSiXggl9rVl9ld996liTZ4vN16JNR6IrRHqBUacTiRhX4ETWgdrr4ajKZi7r0BoyZuTv3XkQWNNTInzWk0fcnd7CDw",
    instagram: "rohit_sharma_lifts"
  },
  {
    id: "trainer-aditi",
    name: "Aditi Rao",
    specialty: "High Intensity Conditioning",
    experience: "6+ Years Athletic Training",
    certifications: ["ACE-CPT", "TRX Suspension Master Coach"],
    bio: "Aditi designs rapid weight loss programs emphasizing metabolic conditioning rhythms and zone heart-rate optimizations.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAt_HOMvpotaxRSrV_HWr0lblzQAnHfSHn1P_dDrpPFQFqzeFtpc5irUxz7GTfNjfX_VgeE7Bgl4af96mLJO1D_yiRpkhy3j7epmWiqLc1ks3jxeye3D-rY1L846YS5aZp5Y_-JY9DOjKXr6h1aFHeoEIa0zNcUTUmiLpC7OzVJ8q8kze8yaJTpGQHIaaOJQ0j4mTnGn6LWgpOk5uefPmJ1babR7uSg9v-HMn0Q0KbLqObWfsXxI2doSqdXuhEfTr9_lxKNtkeFFOw",
    instagram: "aditi_kinetics"
  },
  {
    id: "trainer-karan",
    name: "Karan Kundra",
    specialty: "Olympic Weightlifting & Metcon",
    experience: "5+ Years CrossFit Coach",
    certifications: ["CrossFit Level 2 Coach", "ASCA Olympic L1", "ACE-CPT"],
    bio: "Passionate about explosive kinetic force production, gymnastics bar hygiene, and structured muscle building pathways.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDsbE0zkc5syu0mPnUOHxooZ380zUN7K5qvSRi6YivCZrjFptOVOEdLHxMKjSstuvVhuw23ANiz3xDNoZbRzKM-4S__yYTHBcP9dhDS0GcmS9T3u21l9EqL71QMtVdS5OTnxm1BKDoqsjyyKO6fXL-r4EamjN_3LyxP2_ILpy3IHTKDGbItcQd78nevn8qU28jy9LgN-2rD_lt7i8jmWBaCaurZ_0CjAgaGRDFLpp3wyO25nnNGD1Xoqgd0erhMp3c8qt5NaeJsqbM",
    instagram: "karan_cf_metcon"
  }
];
export const GALLERY_ITEMS = [
  {
    id: "gallery-1",
    title: "Elite Strength Floor",
    description: "Equipped with custom matte coated plates, specialized power cages, and official Real Leader USA pin-selected racks.",
    category: "Floor",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCjr0WZYB2WIx9gR6BF1xHDKvgpcNQEWOGA5jp72grreuNi_5sDoOob994albOIdTtjPnWqrRdDt87SHr8XOt01A-l74VuSnUn7__DjlzXo1OOCbhAIyIUbvU9rpXX9VvC7oZnVA3R-QPBARDPtJQzHLurbp88UzrxZGbLn4XNntV-ujRhCFUZIXwSziGPgFly7En4dWUmhyZ8s-853MFzGBtfuIPYX0QlRoN_-L-oxsDyN3qbmEg_6nrl1zjZ8uxzp0Ecc3m3LdQM"
  },
  {
    id: "gallery-2",
    title: "Metcon CrossFit Rig",
    description: "Features a 30-foot central pull-up rig, gymnastics wall-balls, rogue concept-2 rowers and skiergs.",
    category: "CrossFit",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDAVs1hC75ipnjlGbmNO2F3ltwsFsm2dAugqfpgylqtFONh8tVgVMzJTy5HDc9AWVsOZoQJgxscmpbpDpDef2X4qiGFqfGjSbV2_vODb_gjBYYlwp31pKdGG5cjw7yI7d5g0K4lvAAk7iBKzoL1GCT4Hh3_4aRAv5BmPpbnhiDQx1WuwDBeqpFQEOFGpuQHZnfjgMXuPKMtTklRHeO4JkRPm3wPh9ZFkho4TBi2U4lYgpnG3RiJOS91NHx6pvwjUynwZng-pdsnfXI"
  }
];
