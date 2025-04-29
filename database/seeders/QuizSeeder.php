<?php

namespace Database\Seeders;

use App\Models\Script;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class QuizSeeder extends Seeder
{
    public function run()
    {
        Script::firstOrCreate(
            ['key' => 'hiragana'],
            ['title' => 'Hiragana']
        );
        $quizData = [
            'hiragana' => [
                'title' => 'Hiragana',
                'categories' => [
                    'basic' => [
                        'name' => 'Basic (Gojūon)',
                        'subCategories' => [
                            'Vowels' => ['あ' => 'a', 'い' => 'i', 'う' => 'u', 'え' => 'e', 'お' => 'o'],
                            'K-' => ['か' => 'ka', 'き' => 'ki', 'く' => 'ku', 'け' => 'ke', 'こ' => 'ko'],
                            'S-' => ['さ' => 'sa', 'し' => 'shi', 'す' => 'su', 'せ' => 'se', 'そ' => 'so'],
                            'T-' => ['た' => 'ta', 'ち' => 'chi', 'つ' => 'tsu', 'て' => 'te', 'と' => 'to'],
                            'N-' => ['な' => 'na', 'に' => 'ni', 'ぬ' => 'nu', 'ね' => 'ne', 'の' => 'no', 'ん' => 'n'],
                            'H-' => ['は' => 'ha', 'ひ' => 'hi', 'ふ' => 'fu', 'へ' => 'he', 'ほ' => 'ho'],
                            'M-' => ['ま' => 'ma', 'み' => 'mi', 'む' => 'mu', 'め' => 'me', 'も' => 'mo'],
                            'Y-' => ['や' => 'ya', 'ゆ' => 'yu', 'よ' => 'yo'],
                            'R-' => ['ら' => 'ra', 'り' => 'ri', 'る' => 'ru', 'れ' => 're', 'ろ' => 'ro'],
                            'W-' => ['わ' => 'wa', 'を' => 'o']
                        ],
                    ],
                    'dakuten' => [
                        'name' => 'Dakuten/Handakuten',
                        'subCategories' => [
                            'G-' => ['が' => 'ga', 'ぎ' => 'gi', 'ぐ' => 'gu', 'げ' => 'ge', 'ご' => 'go'],
                            'Z-' => ['ざ' => 'za', 'じ' => 'ji', 'ず' => 'zu', 'ぜ' => 'ze', 'ぞ' => 'zo'],
                            'D-' => ['だ' => 'da', 'ぢ' => 'ji', 'づ' => 'zu', 'で' => 'de', 'ど' => 'do'],
                            'B-' => ['ば' => 'ba', 'び' => 'bi', 'ぶ' => 'bu', 'べ' => 'be', 'ぼ' => 'bo'],
                            'P-' => ['ぱ' => 'pa', 'ぴ' => 'pi', 'ぷ' => 'pu', 'ぺ' => 'pe', 'ぽ' => 'po']
                        ],
                    ],
                    'yoon' => [
                        'name' => 'Yōon (Kombinasi)',
                        'subCategories' => [
                            'K-' => ['きゃ' => 'kya', 'きゅ' => 'kyu', 'きょ' => 'kyo'],
                            'S-' => ['しゃ' => 'sha', 'しゅ' => 'shu', 'しょ' => 'sho'],
                            'T-' => ['ちゃ' => 'cha', 'ちゅ' => 'chu', 'ちょ' => 'cho'],
                            'N-' => ['にゃ' => 'nya', 'にゅ' => 'nyu', 'にょ' => 'nyo'],
                            'H-' => ['ひゃ' => 'hya', 'ひゅ' => 'hyu', 'ひょ' => 'hyo'],
                            'M-' => ['みゃ' => 'mya', 'みゅ' => 'myu', 'みょ' => 'myo'],
                            'R-' => ['りゃ' => 'rya', 'りゅ' => 'ryu', 'りょ' => 'ryo'],
                            'G-' => ['ぎゃ' => 'gya', 'ぎゅ' => 'gyu', 'ぎょ' => 'gyo'],
                            'J-' => ['じゃ' => 'ja', 'じゅ' => 'ju', 'じょ' => 'jo'],
                            'B-' => ['びゃ' => 'bya', 'びゅ' => 'byu', 'びょ' => 'byo'],
                            'P-' => ['ぴゃ' => 'pya', 'ぴゅ' => 'pyu', 'ぴょ' => 'pyo']
                        ],
                    ],
                ],
            ],

            'katakana' => [
                'title' => 'Katakana',
                'categories' => [
                    'basic' => [
                        'name' => 'Basic (Gojūon)',
                        'subCategories' => [
                            'Vowels' => ['ア' => 'a', 'イ' => 'i', 'ウ' => 'u', 'エ' => 'e', 'オ' => 'o'],
                            'K-' => ['カ' => 'ka', 'キ' => 'ki', 'ク' => 'ku', 'ケ' => 'ke', 'コ' => 'ko'],
                            'S-' => ['サ' => 'sa', 'シ' => 'shi', 'ス' => 'su', 'セ' => 'se', 'ソ' => 'so'],
                            'T-' => ['タ' => 'ta', 'チ' => 'chi', 'ツ' => 'tsu', 'テ' => 'te', 'ト' => 'to'],
                            'N-' => ['ナ' => 'na', 'ニ' => 'ni', 'ヌ' => 'nu', 'ネ' => 'ne', 'ノ' => 'no', 'ン' => 'n'],
                            'H-' => ['ハ' => 'ha', 'ヒ' => 'hi', 'フ' => 'fu', 'ヘ' => 'he', 'ホ' => 'ho'],
                            'M-' => ['マ' => 'ma', 'ミ' => 'mi', 'ム' => 'mu', 'メ' => 'me', 'モ' => 'mo'],
                            'Y-' => ['ヤ' => 'ya', 'ユ' => 'yu', 'ヨ' => 'yo'],
                            'R-' => ['ラ' => 'ra', 'リ' => 'ri', 'ル' => 'ru', 'レ' => 're', 'ロ' => 'ro'],
                            'W-' => ['ワ' => 'wa', 'ヲ' => 'o']
                        ],
                    ],

                    'dakuten' => [
                        'name' => 'Dakuten/Handakuten',
                        'subCategories' => [
                            'G-' => ['ガ' => 'ga', 'ギ' => 'gi', 'グ' => 'gu', 'ゲ' => 'ge', 'ゴ' => 'go'],
                            'Z-' => ['ザ' => 'za', 'ジ' => 'ji', 'ズ' => 'zu', 'ゼ' => 'ze', 'ゾ' => 'zo'],
                            'D-' => ['ダ' => 'da', 'ヂ' => 'ji', 'ヅ' => 'zu', 'デ' => 'de', 'ド' => 'do'],
                            'B-' => ['バ' => 'ba', 'ビ' => 'bi', 'ブ' => 'bu', 'ベ' => 'be', 'ボ' => 'bo'],
                            'P-' => ['パ' => 'pa', 'ピ' => 'pi', 'プ' => 'pu', 'ペ' => 'pe', 'ポ' => 'po']
                        ],
                    ],
                    'yoon' => [
                        'name' => 'Yōon (Kombinasi)',
                        'subCategories' => [
                            'K-' => ['キャ' => 'kya', 'キュ' => 'kyu', 'キョ' => 'kyo'],
                            'S-' => ['シャ' => 'sha', 'シュ' => 'shu', 'ショ' => 'sho'],
                            'T-' => ['チャ' => 'cha', 'チュ' => 'chu', 'チョ' => 'cho'],
                            'N-' => ['ニャ' => 'nya', 'ニュ' => 'nyu', 'ニョ' => 'nyo'],
                            'H-' => ['ヒャ' => 'hya', 'ヒュ' => 'hyu', 'ヒョ' => 'hyo'],
                            'M-' => ['ミャ' => 'mya', 'ミュ' => 'myu', 'ミョ' => 'myo'],
                            'R-' => ['リャ' => 'rya', 'リュ' => 'ryu', 'リョ' => 'ryo'],
                            'G-' => ['ギャ' => 'gya', 'ギュ' => 'gyu', 'ギョ' => 'gyo'],
                            'J-' => ['ジャ' => 'ja', 'ジュ' => 'ju', 'ジョ' => 'jo'],
                            'B-' => ['ビャ' => 'bya', 'ビュ' => 'byu', 'ビョ' => 'byo'],
                            'P-' => ['ピャ' => 'pya', 'ピュ' => 'pyu', 'ピョ' => 'pyo']
                        ],
                    ],
                    'extended' => [
                        'name' => 'Extended Katakana',
                        'subCategories' => [
                            'All' => [
                                'ヴ' => 'vu',
                                'ウィ' => 'wi',
                                'ウェ' => 'we',
                                'ウォ' => 'wo',
                                'シェ' => 'she',
                                'ジェ' => 'je',
                                'チェ' => 'che',
                                'ティ' => 'ti',
                                'ディ' => 'di',
                                'トゥ' => 'tu',
                                'ドゥ' => 'du',
                                'ファ' => 'fa',
                                'フィ' => 'fi',
                                'フェ' => 'fe',
                                'フォ' => 'fo'
                            ]
                        ],
                    ],
                ],
            ],

            'kanji' => [
                'title' => 'Kanji',
                'categories' => [
                    'n5' => [
                        'name' => 'JLPT N5 Level',
                        'subCategories' => [
                            'Numbers' => [
                                '一' => 'ichi (1)',
                                '二' => 'ni (2)',
                                '三' => 'san (3)',
                                '四' => 'shi/yon (4)',
                                '五' => 'go (5)',
                                '六' => 'roku (6)',
                                '七' => 'shichi/nana (7)',
                                '八' => 'hachi (8)',
                                '九' => 'kyuu (9)',
                                '十' => 'juu (10)',
                                '百' => 'hyaku (100)',
                                '千' => 'sen (1,000)',
                                '万' => 'man (10,000)',
                                '円' => 'en (Yen)'
                            ],
                            'Time & Calendar' => [
                                '日' => 'nichi (day/sun)',
                                '月' => 'getsu (month/moon)',
                                '年' => 'nen (year)',
                                '時' => 'ji (time/hour)',
                                '分' => 'fun (minute)',
                                '間' => 'kan (interval)',
                                '今' => 'ima (now)',
                                '午' => 'go (noon)',
                                '前' => 'mae (before)',
                                '後' => 'ato (after)',
                                '曜' => 'you (day of week)'
                            ],
                            'People & Family' => [
                                '人' => 'hito (person)',
                                '男' => 'otoko (man)',
                                '女' => 'onna (woman)',
                                '子' => 'ko (child)',
                                '父' => 'chichi (father)',
                                '母' => 'haha (mother)',
                                '友' => 'tomo (friend)',
                                '名' => 'na (name)',
                                '先' => 'saki (previous)',
                                '生' => 'sei (life)',
                                '兄' => 'ani (older brother)',
                                '弟' => 'otouto (younger brother)',
                                '姉' => 'ane (older sister)',
                                '妹' => 'imouto (younger sister)'
                            ],
                            'Places & Directions' => [
                                '山' => 'yama (mountain)',
                                '川' => 'kawa (river)',
                                '田' => 'ta (rice field)',
                                '町' => 'machi (town)',
                                '村' => 'mura (village)',
                                '校' => 'kou (school)',
                                '国' => 'kuni (country)',
                                '家' => 'ie (house)',
                                '上' => 'ue (up)',
                                '下' => 'shita (down)',
                                '左' => 'hidari (left)',
                                '右' => 'migi (right)',
                                '東' => 'higashi (east)',
                                '西' => 'nishi (west)',
                                '南' => 'minami (south)',
                                '北' => 'kita (north)',
                                '外' => 'soto (outside)',
                                '中' => 'naka (inside)',
                                '駅' => 'eki (station)',
                                '道' => 'michi (road)'
                            ],
                            'Common Verbs' => [
                                '行' => 'iku (go)',
                                '来' => 'kuru (come)',
                                '見' => 'miru (see)',
                                '聞' => 'kiku (hear)',
                                '話' => 'hanasu (speak)',
                                '食' => 'taberu (eat)',
                                '飲' => 'nomu (drink)',
                                '書' => 'kaku (write)',
                                '読' => 'yomu (read)',
                                '出' => 'deru (exit)',
                                '入' => 'hairu (enter)',
                                '立' => 'tatsu (stand)',
                                '休' => 'yasumu (rest)',
                                '買' => 'kau (buy)',
                                '売' => 'uru (sell)',
                                '使' => 'tsukau (use)',
                                '作' => 'tsukuru (make)',
                                '開' => 'aku (open)',
                                '閉' => 'shimaru (close)',
                                '始' => 'hajimeru (start)',
                                '終' => 'owaru (end)',
                                '待' => 'matsu (wait)',
                                '帰' => 'kaeru (return)'
                            ],
                            'Adjectives' => [
                                '大' => 'dai (big)',
                                '小' => 'shou (small)',
                                '高' => 'takai (tall/expensive)',
                                '安' => 'yasui (cheap)',
                                '新' => 'atarashii (new)',
                                '古' => 'furui (old)',
                                '長' => 'nagai (long)',
                                '短' => 'mijikai (short)',
                                '多' => 'ooi (many)',
                                '少' => 'sukunai (few)',
                                '楽' => 'tanoshii (fun)',
                                '好' => 'suki (like)',
                                '思' => 'omou (think)',
                                '知' => 'shiru (know)'
                            ],
                            'Nature & Weather' => [
                                '天' => 'ten (heaven)',
                                '気' => 'ki (spirit)',
                                '雨' => 'ame (rain)',
                                '雪' => 'yuki (snow)',
                                '風' => 'kaze (wind)',
                                '空' => 'sora (sky)',
                                '火' => 'hi (fire)',
                                '水' => 'mizu (water)',
                                '木' => 'ki (tree)',
                                '土' => 'tsuchi (earth)'
                            ],
                            'Colors' => [
                                '白' => 'shiro (white)',
                                '黒' => 'kuro (black)',
                                '赤' => 'aka (red)',
                                '青' => 'ao (blue)',
                                '色' => 'iro (color)'
                            ]
                        ],
                    ],
                    'n4' => [
                        'name' => 'JLPT N4 Level',
                        'subCategories' => [
                            'Time & Calendar' => [
                                '日' => 'nichi (day)',
                                '月' => 'getsu (month)',
                                '年' => 'nen (year)',
                                '時' => 'ji (time)',
                                '分' => 'fun (minute)',
                                '秒' => 'byou (second)',
                                '週' => 'shuu (week)',
                                '曜' => 'you (day of week)',
                                '朝' => 'asa (morning)',
                                '昼' => 'hiru (noon)',
                                '夜' => 'yoru (night)',
                                '季' => 'ki (season)'
                            ],
                            'Numbers & Amounts' => [
                                '百' => 'hyaku (100)',
                                '千' => 'sen (1,000)',
                                '万' => 'man (10,000)',
                                '円' => 'en (Yen)',
                                '零' => 'rei (zero)',
                                '半' => 'han (half)'
                            ],
                            'People & Family' => [
                                '人' => 'hito (person)',
                                '男' => 'otoko (man)',
                                '女' => 'onna (woman)',
                                '父' => 'chichi (father)',
                                '母' => 'haha (mother)',
                                '子' => 'ko (child)',
                                '兄' => 'ani (older brother)',
                                '弟' => 'otouto (younger brother)',
                                '姉' => 'ane (older sister)',
                                '妹' => 'imouto (younger sister)',
                                '夫' => 'otto (husband)',
                                '妻' => 'tsuma (wife)'
                            ],
                            'Places' => [
                                '山' => 'yama (mountain)',
                                '川' => 'kawa (river)',
                                '田' => 'ta (rice field)',
                                '町' => 'machi (town)',
                                '村' => 'mura (village)',
                                '校' => 'kou (school)',
                                '国' => 'kuni (country)',
                                '家' => 'ie (house)',
                                '市' => 'shi (city)',
                                '駅' => 'eki (station)',
                                '道' => 'michi (road)'
                            ],
                            'Common Verbs' => [
                                '行' => 'iku (go)',
                                '来' => 'kuru (come)',
                                '食' => 'taberu (eat)',
                                '飲' => 'nomu (drink)',
                                '見' => 'miru (see)',
                                '聞' => 'kiku (hear)',
                                '話' => 'hanasu (speak)',
                                '読' => 'yomu (read)',
                                '書' => 'kaku (write)',
                                '立' => 'tatsu (stand)',
                                '帰' => 'kaeru (return)',
                                '買' => 'kau (buy)'
                            ],
                            'Adjectives' => [
                                '大' => 'dai (big)',
                                '小' => 'shou (small)',
                                '新' => 'shin (new)',
                                '古' => 'ko (old)',
                                '高' => 'kou (high/expensive)',
                                '安' => 'an (cheap)',
                                '早' => 'sou (fast/early)',
                                '多' => 'ta (many)',
                                '長' => 'nagai (long)',
                                '短' => 'mijikai (short)'
                            ],
                            'Nature & Weather' => [
                                '木' => 'moku (tree)',
                                '林' => 'rin (grove)',
                                '森' => 'mori (forest)',
                                '火' => 'ka (fire)',
                                '水' => 'sui (water)',
                                '雨' => 'ame (rain)',
                                '風' => 'kaze (wind)',
                                '雪' => 'yuki (snow)',
                                '天' => 'ten (sky)',
                                '気' => 'ki (energy)',
                                '土' => 'tsuchi (earth)',
                                '霧' => 'kiri (fog)',
                                '雷' => 'kaminari (thunder)'
                            ],
                            'Colors' => [
                                '赤' => 'aka (red)',
                                '青' => 'ao (blue)',
                                '白' => 'shiro (white)',
                                '黒' => 'kuro (black)',
                                '色' => 'iro (color)',
                                '灰' => 'hai (gray)'
                            ],
                            'Transportation' => [
                                '車' => 'kuruma (car)',
                                '電' => 'den (electricity)',
                                '道' => 'michi (road)',
                                '空' => 'sora (sky)',
                                '港' => 'minato (harbor)',
                                '北' => 'kita (north)',
                                '南' => 'minami (south)',
                                '東' => 'higashi (east)',
                                '西' => 'nishi (west)',
                                '線' => 'sen (line)'
                            ],
                            'Daily Activities' => [
                                '寝' => 'neru (sleep)',
                                '起' => 'okiru (wake up)',
                                '働' => 'hataraku (work)',
                                '休' => 'yasumu (rest)',
                                '洗' => 'arau (wash)',
                                '浴' => 'abiru (bathe)',
                                '遊' => 'asobu (play)',
                                '走' => 'hashiru (run)'
                            ],
                            'Food & Drink' => [
                                '米' => 'kome (rice)',
                                '肉' => 'niku (meat)',
                                '魚' => 'sakana (fish)',
                                '飲' => 'nomu (drink)',
                                '茶' => 'cha (tea)',
                                '飯' => 'meshi (meal)',
                                '酒' => 'sake (alcohol)'
                            ],
                            'Work & Education' => [
                                '仕' => 'shi (work)',
                                '学' => 'gaku (study)',
                                '校' => 'kou (school)',
                                '教' => 'kyou (teach)',
                                '医' => 'i (doctor)',
                                '院' => 'in (institution)',
                                '業' => 'gyou (business)',
                                '試' => 'tamesu (test)',
                                '社' => 'sha (company)',
                                '術' => 'jutsu (technique)'
                            ],
                            'Emotions' => [
                                '楽' => 'tanoshii (happy)',
                                '悲' => 'kanashii (sad)',
                                '喜' => 'yorokobu (joy)',
                                '怒' => 'okoru (anger)',
                                '哀' => 'ai (sorrow)',
                                '驚' => 'odoroku (surprise)'
                            ],
                            'Other Important Verbs' => [
                                '会' => 'au (meet)',
                                '思' => 'omou (think)',
                                '使' => 'tsukau (use)',
                                '待' => 'matsu (wait)',
                                '送' => 'okuru (send)',
                                '出' => 'deru (exit)',
                                '入' => 'hairu (enter)',
                                '開' => 'aku (open)',
                                '選' => 'eru (choose)'
                            ]
                        ],
                    ],
                ],
            ],
        ];

        foreach ($quizData as $scriptKey => $script) {
            // Gunakan firstOrCreate untuk menghindari duplikasi
            $scriptModel = Script::firstOrCreate(
                ['key' => $scriptKey],
                ['title' => $script['title']]
            );
            $scriptId = $scriptModel->id;

            foreach ($script['categories'] as $categoryKey => $category) {
                $categoryId = DB::table('categories')->insertGetId([
                    'script_id' => $scriptId,
                    'key' => $categoryKey,
                    'name' => $category['name'],
                ]);

                foreach ($category['subCategories'] as $subCategoryKey => $subCategory) {
                    $subCategoryId = DB::table('sub_categories')->insertGetId([
                        'category_id' => $categoryId,
                        'key' => $subCategoryKey,
                    ]);

                    foreach ($subCategory as $character => $reading) {
                        DB::table('questions')->insert([
                            'sub_category_id' => $subCategoryId,
                            'character' => $character,
                            'reading' => $reading,
                        ]);
                    }
                }
            }
        }
    }
}
