/**
 * i18n.js — Arabic translation.
 *
 * HOW THIS WORKS
 * --------------
 * Rather than wrapping every string in the ~50 source files with a t() call,
 * this translates the rendered DOM after each render: it walks text nodes and
 * the handful of user-visible attributes, and swaps anything it recognises.
 *
 * The reason is the architecture. There is no build step, and a full render
 * rebuilds the tree on every state change — so a post-render pass is both
 * cheap and total. It covers every screen, modal and panel, including the
 * auth pages, without a single page module having to know about languages.
 *
 * The trade-off: only phrases present in the dictionary below are translated,
 * and a *data* value that happens to match a UI phrase would be translated
 * too. That is why the dictionary deliberately contains interface copy only.
 * Patient names, dentists, vendors, cities and SKUs stay as they are — which
 * is also what a real clinic would want, since those are proper nouns.
 *
 * @module core/i18n
 */
(function () {
  'use strict';

  /**
   * English → Arabic.
   *
   * Keyed by the English string itself, so no key invention is needed and
   * anything missing falls back to English rather than showing a raw key.
   */
  const AR = {
    /* — Navigation ——————————————————————————————————————————— */
    'Dashboard': 'لوحة التحكم',
    'Reservations': 'الحجوزات',
    'Patients': 'المرضى',
    'Treatments': 'العلاجات',
    'Staff List': 'قائمة الموظفين',
    'Accounts': 'الحسابات',
    'Sales': 'المبيعات',
    'Purchases': 'المشتريات',
    'Payment Method': 'طرق الدفع',
    'Website Settings': 'إعدادات الموقع',
    'Website Analytics': 'تحليلات الموقع',
    'Stocks': 'المخزون',
    'Peripherals': 'الأجهزة',
    'Report': 'التقارير',
    'Customer Support': 'دعم العملاء',
    'Patient': 'المريض',
    'CLINIC': 'العيادة',
    'FINANCE': 'المالية',
    'WEBSITE': 'الموقع الإلكتروني',
    'PHYSICAL ASSET': 'الأصول المادية',

    /* — Shell ————————————————————————————————————————————————— */
    'Search patients, doctors, treatments, stock...': 'ابحث عن مرضى، أطباء، علاجات، مخزون...',
    'Super admin': 'مدير عام',
    'Notifications': 'الإشعارات',
    'Open menu': 'فتح القائمة',
    'Close menu': 'إغلاق القائمة',
    'New': 'جديد',
    'Clear search': 'مسح البحث',
    'Switch to dark theme': 'التبديل إلى الوضع الداكن',
    'Switch to light theme': 'التبديل إلى الوضع الفاتح',
    'results for': 'نتيجة لـ',
    'Clear': 'مسح',
    'Nothing matched. Try a patient, doctor, treatment or product name.':
      'لا توجد نتائج. جرّب اسم مريض أو طبيب أو علاج أو منتج.',
    'PATIENT': 'مريض',
    'DOCTOR': 'طبيب',
    'TREATMENT': 'علاج',
    'RESERVATION': 'حجز',
    'STOCK': 'مخزون',
    'EQUIPMENT': 'جهاز',

    /* — Common actions ————————————————————————————————————————— */
    'Save': 'حفظ',
    'Cancel': 'إلغاء',
    'Close': 'إغلاق',
    'Edit': 'تعديل',
    'Delete': 'حذف',
    'Add': 'إضافة',
    'Filters': 'عوامل التصفية',
    'Back': 'رجوع',
    'Next': 'التالي',
    'Continue': 'متابعة',
    'Confirm': 'تأكيد',
    'View all': 'عرض الكل',
    'Order': 'طلب',
    'Export all': 'تصدير الكل',
    'Search patients...': 'ابحث عن مريض...',
    'Search patient...': 'ابحث عن مريض...',
    'Search doctor or email...': 'ابحث باسم الطبيب أو البريد...',
    'Search product or SKU...': 'ابحث بالمنتج أو الرمز...',

    /* — Dashboard ——————————————————————————————————————————— */
    'Cashflow': 'التدفق النقدي',
    'TOTAL CASH': 'إجمالي النقد',
    'Income & Expense': 'الإيرادات والمصروفات',
    'INCOME': 'الإيرادات',
    'EXPENSE': 'المصروفات',
    'New patients': 'مرضى جدد',
    'Returning': 'مرضى عائدون',
    'Popular Treatment': 'العلاجات الأكثر طلباً',
    'Expenses': 'المصروفات',
    'Total Expense': 'إجمالي المصروفات',
    'TOP EXPENSE': 'أعلى المصروفات',
    'Stock availability': 'توفر المخزون',
    'TOTAL ASSET': 'إجمالي الأصول',
    'TOTAL PRODUCT': 'إجمالي المنتجات',
    'Available': 'متوفر',
    'Low stock': 'مخزون منخفض',
    'Out of stock': 'نفد المخزون',
    'LOW STOCK': 'مخزون منخفض',
    'Last 12 months': 'آخر ١٢ شهراً',
    'Last 6 months': 'آخر ٦ أشهر',
    'Last 3 months': 'آخر ٣ أشهر',
    'This month': 'هذا الشهر',
    'This quarter': 'هذا الربع',
    'This year': 'هذه السنة',

    /* — Reservations ————————————————————————————————————————— */
    'Calendar': 'التقويم',
    'Log History': 'سجل النشاط',
    'appointments shown': 'موعد معروض',
    'Today': 'اليوم',
    'New Appointment': 'موعد جديد',
    'All dentists': 'كل الأطباء',
    'All statuses': 'كل الحالات',
    'All treatments': 'كل العلاجات',
    'Clear filters': 'مسح عوامل التصفية',
    'Drag a card to move it to another time or dentist':
      'اسحب البطاقة لنقلها إلى وقت أو طبيب آخر',
    'Add doctor': 'إضافة طبيب',
    'Edit working hours': 'تعديل ساعات العمل',
    'Edit doctor': 'تعديل بيانات الطبيب',
    'BREAK': 'استراحة',
    'UNAVAILABLE': 'غير متاح',
    'Book this slot': 'احجز هذا الموعد',
    'Outside working hours': 'خارج ساعات العمل',
    'today': 'اليوم',
    'Registered': 'مسجّل',
    'Waiting': 'في الانتظار',
    'Encounter': 'قيد الكشف',
    'Finished': 'منتهي',
    'REGISTERED': 'مسجّل',
    'WAITING': 'في الانتظار',
    'ENCOUNTER': 'قيد الكشف',
    'FINISHED': 'منتهي',
    'RESERVATION ID': 'رقم الحجز',
    'TIME': 'الوقت',
    'ACTIVITY': 'النشاط',
    'DENTIST': 'الطبيب',

    /* — Patients ————————————————————————————————————————————— */
    'total patients': 'إجمالي المرضى',
    'Add Patient': 'إضافة مريض',
    'PATIENT NAME': 'اسم المريض',
    'PHONE': 'الهاتف',
    'EMAIL': 'البريد الإلكتروني',
    'REGISTERED': 'تاريخ التسجيل',
    'LAST VISIT': 'آخر زيارة',
    'LAST TREATMENT': 'آخر علاج',
    'No patients match this search': 'لا يوجد مرضى مطابقون لهذا البحث',
    'Try a different name.': 'جرّب اسماً آخر.',
    'Patient list': 'قائمة المرضى',
    'Patient detail': 'تفاصيل المريض',
    'Patient Information': 'بيانات المريض',
    'Appointment History': 'سجل المواعيد',
    'Next Treatment': 'العلاج القادم',
    'Medical Record': 'السجل الطبي',
    'Edit Patient': 'تعديل بيانات المريض',
    'Create Appointment': 'إنشاء موعد',
    'GENERAL INFO': 'معلومات عامة',
    'ORAL HYGIENE HABITS': 'عادات العناية بالفم',
    'FULL NAME': 'الاسم الكامل',
    'AGE': 'العمر',
    'GENDER': 'الجنس',
    'ADDRESS': 'العنوان',
    'Female': 'أنثى',
    'Male': 'ذكر',
    'Odontogram': 'مخطط الأسنان',
    'Treated': 'تمت المعالجة',
    'Pending': 'قيد الانتظار',
    'Healthy': 'سليم',
    'CONDITION': 'الحالة',
    'DONE': 'منجز',
    'UPCOMING': 'قادم',
    'Done': 'منجز',

    /* — Treatments ——————————————————————————————————————————— */
    'Active Treatment': 'العلاجات النشطة',
    'Inactive Treatment': 'العلاجات غير النشطة',
    'treatments': 'علاج',
    'Add Treatment': 'إضافة علاج',
    'TREATMENT NAME': 'اسم العلاج',
    'PRICE': 'السعر',
    'ESTIMATE DURATION': 'المدة التقديرية',
    'TYPE OF VISIT': 'نوع الزيارة',
    'RATING': 'التقييم',
    'REVIEW': 'المراجعات',
    'SINGLE VISIT': 'زيارة واحدة',
    'MULTIPLE VISIT': 'زيارات متعددة',
    'SAMPLE': 'نموذج',
    'Start from': 'يبدأ من',
    'SINGLE': 'مفردة',
    'MULTIPLE': 'متعددة',

    /* — Staff ———————————————————————————————————————————————— */
    'Doctor Staff': 'الأطباء',
    'General Staff': 'الموظفون',
    'doctors': 'طبيب',
    'Add Doctor': 'إضافة طبيب',
    'NAME': 'الاسم',
    'CONTACT': 'وسائل التواصل',
    'WORKING DAYS': 'أيام العمل',
    'ASSIGNED TREATMENT': 'العلاجات المسندة',
    'TYPE': 'النوع',
    'HOURS': 'ساعات العمل',
    'FULL-TIME': 'دوام كامل',
    'PART-TIME': 'دوام جزئي',
    'All specialties': 'كل التخصصات',
    'All types': 'كل الأنواع',
    'Full-time': 'دوام كامل',
    'Part-time': 'دوام جزئي',
    'Any working day': 'أي يوم عمل',
    'No doctors match these filters': 'لا يوجد أطباء مطابقون لعوامل التصفية',
    'Try clearing the specialty or working-day filter.':
      'جرّب مسح تصفية التخصص أو يوم العمل.',

    /* — Accounts / finance ———————————————————————————————————— */
    'TOTAL ASSET VALUE': 'إجمالي قيمة الأصول',
    'LIQUID ASSETS': 'الأصول السائلة',
    'PHYSICAL ASSETS': 'الأصول المادية',
    'List Account': 'قائمة الحسابات',
    'All accounts are set up manually': 'يتم إعداد جميع الحسابات يدوياً',
    'Transfer money': 'تحويل الأموال',
    'Add new account': 'إضافة حساب جديد',
    'ACTIVE LIST': 'الحسابات النشطة',
    'INACTIVE LIST': 'الحسابات غير النشطة',
    'Activate': 'تفعيل',
    'FREE CASH': 'النقد المتاح',
    'DRUG PURCHASE': 'شراء الأدوية',
    'TREATMENT FUND': 'صندوق العلاج',
    'STOCK FUND': 'صندوق المخزون',
    'MONTHLY RENT': 'الإيجار الشهري',
    'EQUIPMENT LEASE': 'إيجار المعدات',
    'STAFF TRAINING': 'تدريب الموظفين',
    'Payment Methods': 'طرق الدفع',
    'Methods your front desk can accept at checkout':
      'الطرق التي يقبلها الاستقبال عند الدفع',
    'Add Method': 'إضافة طريقة',
    'FEE': 'الرسوم',
    'USED THIS MONTH': 'الاستخدام هذا الشهر',
    'Cash': 'نقداً',
    'Credit card': 'بطاقة ائتمان',
    'Debit card': 'بطاقة خصم',
    'Bank transfer': 'تحويل بنكي',
    'Insurance claim': 'مطالبة تأمين',
    'E-wallet': 'محفظة إلكترونية',
    'purchased this month': 'مشتريات هذا الشهر',
    'New Purchase': 'عملية شراء جديدة',
    'INVOICE': 'الفاتورة',
    'VENDOR': 'المورّد',
    'CATEGORY': 'الفئة',
    'DATE': 'التاريخ',
    'AMOUNT': 'المبلغ',
    'STATUS': 'الحالة',
    'PAID': 'مدفوع',
    'DUE': 'مستحق',

    /* — Stocks / peripherals —————————————————————————————————— */
    'Inventory': 'الجرد',
    'Order Stock': 'طلب مخزون',
    'New Product': 'منتج جديد',
    'SKU': 'الرمز',
    'IN STOCK': 'متوفر',
    'OUT OF STOCK': 'نفد',
    'ASSET VALUE': 'قيمة الأصل',
    'ORDER': 'الطلب',
    'CREATED': 'تاريخ الإنشاء',
    'FROM VENDOR': 'المورّد',
    'ITEM RECEIVED': 'المستلم',
    'COMPLETE': 'مكتمل',
    'PENDING': 'قيد الانتظار',
    'PARTIAL': 'جزئي',
    'Receive': 'استلام',
    'Received': 'تم الاستلام',
    'equipment items': 'جهاز',
    'Add Peripheral': 'إضافة جهاز',
    'ASSIGNED TO': 'مخصص لـ',
    'IN USE': 'قيد الاستخدام',
    'NOT USED': 'غير مستخدم',
    'DRAFT': 'مسودة',

    /* — Reports / support ————————————————————————————————————— */
    'Saved reports': 'التقارير المحفوظة',
    'REPORT': 'التقرير',
    'PERIOD': 'الفترة',
    'GENERATED': 'تاريخ الإنشاء',
    'FORMAT': 'الصيغة',
    'Reports generated': 'التقارير المُنشأة',
    'Scheduled exports': 'التصديرات المجدولة',
    'Inbox': 'صندوق الوارد',
    'Write a reply...': 'اكتب رداً...',
    'Send reply': 'إرسال الرد',
    'Mark resolved': 'وضع علامة كمحلول',
    'OPEN': 'مفتوح',

    /* — Website builder ——————————————————————————————————————— */
    'Page sections': 'أقسام الصفحة',
    'Preview site': 'معاينة الموقع',
    'Publish': 'نشر',
    'sections live': 'قسم منشور',
    'hidden': 'مخفي',
    'Unpublished changes': 'تغييرات غير منشورة',
    'All changes published': 'تم نشر جميع التغييرات',
    'Show or hide this section': 'إظهار أو إخفاء هذا القسم',
    'Move up': 'تحريك لأعلى',
    'Move down': 'تحريك لأسفل',
    'Visible': 'ظاهر',
    'Hidden': 'مخفي',

    /* — Analytics ————————————————————————————————————————————— */
    'Last 7 days': 'آخر ٧ أيام',
    'Last 30 days': 'آخر ٣٠ يوماً',
    'Last 90 days': 'آخر ٩٠ يوماً',
    'Countries': 'الدول',
    'Cities': 'المدن',
    'Submitted form': 'أرسل النموذج',
    'Called': 'اتصل',
    'Browsed only': 'تصفح فقط',

    /* — Booking modal ————————————————————————————————————————— */
    'Existing patient': 'مريض حالي',
    'New patient': 'مريض جديد',
    'Dentist': 'الطبيب',
    'Treatment': 'العلاج',
    'Date': 'التاريخ',
    'Start time': 'وقت البدء',
    'Duration': 'المدة',
    'Book appointment': 'تأكيد الحجز',
    'Booking': 'حجز',
    'with': 'مع',
    'Full name': 'الاسم الكامل',
    'Phone number': 'رقم الهاتف',
    '1 hour': 'ساعة واحدة',
    '2 hours': 'ساعتان',
    '3 hours': '٣ ساعات',
    'Not available at this time': 'غير متاح في هذا الوقت',
    'Cancel reservation': 'إلغاء الحجز',
    'DETAILS': 'التفاصيل',
    'Summary': 'الملخص',
    'Record': 'السجل',
    'Files': 'الملفات',

    /* — Auth —————————————————————————————————————————————————— */
    'Welcome back': 'مرحباً بعودتك',
    'Sign in to manage appointments, patients and billing.':
      'سجّل الدخول لإدارة المواعيد والمرضى والفواتير.',
    'Email address': 'البريد الإلكتروني',
    'Password': 'كلمة المرور',
    'Forgot password?': 'نسيت كلمة المرور؟',
    'Keep me signed in': 'أبقني مسجلاً',
    'Sign in': 'تسجيل الدخول',
    'Please wait…': 'يرجى الانتظار…',
    'or': 'أو',
    'Staff SSO': 'الدخول الموحد',
    'Passkey': 'مفتاح المرور',
    'Enter your password': 'أدخل كلمة المرور',
    'Show password': 'إظهار كلمة المرور',
    'Hide password': 'إخفاء كلمة المرور',
    'Enter your email address.': 'أدخل بريدك الإلكتروني.',
    'That does not look like a valid email address.': 'صيغة البريد الإلكتروني غير صحيحة.',
    'Enter your password.': 'أدخل كلمة المرور.',
    'Password must be at least 6 characters.': 'يجب ألا تقل كلمة المرور عن ٦ أحرف.',
    'Choose a new password.': 'اختر كلمة مرور جديدة.',
    'Use at least 8 characters.': 'استخدم ٨ أحرف على الأقل.',
    'Passwords do not match.': 'كلمتا المرور غير متطابقتين.',
    'Reset your password': 'إعادة تعيين كلمة المرور',
    'Enter the email address on your account and we will send you a link to choose a new password.':
      'أدخل البريد الإلكتروني المرتبط بحسابك وسنرسل لك رابطاً لاختيار كلمة مرور جديدة.',
    'Send reset link': 'إرسال رابط إعادة التعيين',
    'Back to sign in': 'العودة لتسجيل الدخول',
    'Check your inbox': 'تفقّد بريدك',
    'Open reset link': 'فتح رابط إعادة التعيين',
    'Choose a new password': 'اختر كلمة مرور جديدة',
    'New password': 'كلمة المرور الجديدة',
    'Confirm new password': 'تأكيد كلمة المرور الجديدة',
    'Update password': 'تحديث كلمة المرور',
    'Password updated': 'تم تحديث كلمة المرور',
    'You can now sign in with your new password.':
      'يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.',
    'Continue to sign in': 'المتابعة لتسجيل الدخول',
    'Use at least 8 characters. A passphrase is easier to remember and harder to guess.':
      'استخدم ٨ أحرف على الأقل. العبارة السرية أسهل في التذكر وأصعب في التخمين.',
    'Repeat the password': 'أعد إدخال كلمة المرور',
    'At least 8 characters': '٨ أحرف على الأقل',
    'Protected health information. Access is logged and audited.':
      'معلومات صحية محمية. يتم تسجيل ومراجعة كل عملية دخول.',
    'Everything your clinic runs on, in one place.':
      'كل ما تحتاجه عيادتك، في مكان واحد.',
    'Active patients': 'مرضى نشطون',
    'Practitioners': 'الأطباء',
    'Serving Portland': 'نخدم بورتلاند',

    /* — Profile & account menu ———————————————————————————————— */
    'My profile': 'ملفي الشخصي',
    'My Profile': 'ملفي الشخصي',
    'Change password': 'تغيير كلمة المرور',
    'Sign out': 'تسجيل الخروج',
    'Sign out all': 'تسجيل الخروج من الكل',
    'Account details': 'بيانات الحساب',
    'Security': 'الأمان',
    'Preferences': 'التفضيلات',
    'Job title': 'المسمى الوظيفي',
    'Role': 'الصلاحية',
    'Clinic': 'العيادة',
    'Save changes': 'حفظ التغييرات',
    'Saved': 'تم الحفظ',
    'Member since': 'عضو منذ',
    'Only an owner can change access level.': 'يمكن للمالك فقط تغيير مستوى الصلاحية.',
    'Current password': 'كلمة المرور الحالية',
    'Enter your current password': 'أدخل كلمة المرور الحالية',
    'Update password': 'تحديث كلمة المرور',
    'Enter your current password.': 'أدخل كلمة المرور الحالية.',
    'Repeat the new password.': 'أعد إدخال كلمة المرور الجديدة.',
    'The new password must differ from the current one.':
      'يجب أن تختلف كلمة المرور الجديدة عن الحالية.',
    'Repeat the new password': 'أعد إدخال كلمة المرور الجديدة',
    'Password updated. Use the new one next time you sign in.':
      'تم تحديث كلمة المرور. استخدمها في تسجيل الدخول القادم.',
    'Weak': 'ضعيفة',
    'Fair': 'متوسطة',
    'Strong': 'قوية',
    'Two-factor authentication': 'المصادقة الثنائية',
    'Enabled — authenticator app': 'مُفعّلة — تطبيق المصادقة',
    'Not enabled': 'غير مُفعّلة',
    'Last sign-in': 'آخر تسجيل دخول',
    'Active sessions': 'الجلسات النشطة',
    '2 devices signed in': 'جهازان مسجلان',
    'THIS DEVICE': 'هذا الجهاز',
    'Appearance': 'المظهر',
    'Dark theme': 'الوضع الداكن',
    'Light theme': 'الوضع الفاتح',
    'Switch to light': 'التبديل للفاتح',
    'Switch to dark': 'التبديل للداكن',
    'Language': 'اللغة',
    'English': 'الإنجليزية',
    'Email notifications': 'إشعارات البريد',
    'Daily schedule summary at 07:00': 'ملخص الجدول اليومي الساعة ٧:٠٠',
    'Desktop notifications': 'إشعارات سطح المكتب',
    'New bookings and cancellations': 'الحجوزات والإلغاءات الجديدة',
    'SUPER ADMIN': 'مدير عام',
    'Practice Manager': 'مدير العيادة',
    'Close menu': 'إغلاق القائمة',

    /* — Weekdays & months (also used by the date pattern below) —— */
    'Monday': 'الاثنين', 'Tuesday': 'الثلاثاء', 'Wednesday': 'الأربعاء',
    'Thursday': 'الخميس', 'Friday': 'الجمعة', 'Saturday': 'السبت', 'Sunday': 'الأحد',

    /* — Doctor modal ——————————————————————————————————————————— */
    'STEP 1': 'الخطوة ١', 'STEP 2': 'الخطوة ٢', 'STEP 3': 'الخطوة ٣', 'STEP 4': 'الخطوة ٤',
    'Staff Info': 'بيانات الموظف',
    'Assigned Services': 'الخدمات المسندة',
    'Working Hours': 'ساعات العمل',
    'Days Off': 'أيام الإجازة',
    'Name': 'الاسم',
    'Email Address': 'البريد الإلكتروني',
    'Specialist': 'التخصص',
    'Type': 'النوع',
    'Full time': 'دوام كامل',
    'Part-Time': 'دوام جزئي',
    'Working days': 'أيام العمل',
    'Shift & break': 'الوردية والاستراحة',
    'Starts at': 'يبدأ الساعة',
    'Ends at': 'ينتهي الساعة',
    'Break at': 'الاستراحة الساعة',
    'Previous': 'السابق',
    'Cosmetic services': 'الخدمات التجميلية',
    'Treatment services': 'الخدمات العلاجية',

    /* — Specialities ———————————————————————————————————————————— */
    'Oral Surgery': 'جراحة الفم',
    'General Dentistry': 'طب الأسنان العام',
    'Pediatric Dentistry': 'طب أسنان الأطفال',
    'Orthodontics': 'تقويم الأسنان',
    'Endodontics': 'علاج جذور الأسنان',
    'Periodontics': 'أمراض اللثة',
    'Prosthodontics': 'التركيبات السنية',

    /* — Service & treatment names ——————————————————————————————— */
    'Teeth Whitening': 'تبييض الأسنان',
    'Dental Veneers': 'قشور الأسنان',
    'Dental Bonding': 'ترميم الأسنان',
    'Dental Crown': 'تاج الأسنان',
    'Inlays and Onlays': 'الحشوات التجميلية',
    'Dental Implants': 'زراعة الأسنان',
    'Bridges': 'الجسور',
    'Crowns': 'التيجان',
    'Fillings': 'الحشوات',
    'Root canal treatment': 'علاج جذور الأسنان',
    'General Checkup': 'فحص عام',
    'Scaling': 'تنظيف الجير',
    'Bleaching': 'تبييض',
    'Extraction': 'خلع',
    'Root Canal': 'علاج العصب',
    'Tooth Filling': 'حشو الأسنان',
    'Crown Fitting': 'تركيب تاج',
    'Veneers': 'القشور التجميلية',

    /* — Treatment modal ————————————————————————————————————————— */
    'Basic Info': 'المعلومات الأساسية',
    'Treatment Name': 'اسم العلاج',
    'Treatment Category': 'فئة العلاج',
    'Treatment Description': 'وصف العلاج',
    'Medical Service': 'خدمة علاجية',
    'Cosmetic Service': 'خدمة تجميلية',
    'Price & Duration': 'السعر والمدة',
    'Price Treatment': 'سعر العلاج',
    'Price for all treatment visits': 'السعر لجميع زيارات العلاج',
    'Estimate Duration': 'المدة التقديرية',
    'Duration for one treatment': 'مدة الجلسة الواحدة',
    'Add visit': 'إضافة زيارة',
    'Remove': 'إزالة',
    'e.g. Braces Treatment': 'مثال: علاج التقويم',
    'Describe what this treatment covers...': 'اشرح ما يشمله هذا العلاج...',

    /* — Patient modal ——————————————————————————————————————————— */
    'Add patient': 'إضافة مريض',
    'General info': 'معلومات عامة',
    'Age': 'العمر',
    'Email': 'البريد الإلكتروني',
    'Gender': 'الجنس',
    'Address': 'العنوان',
    'Clinical flag': 'ملاحظة سريرية',
    'Shown on every reservation for this patient.': 'تظهر في كل حجز لهذا المريض.',
    'Street, city, state': 'الشارع، المدينة، المنطقة',
    'e.g. has high blood pressure and diabetes': 'مثال: يعاني من ضغط الدم والسكري',
    'name@mail.com': 'name@mail.com',
    'name@northgate.com': 'name@northgate.com',

    /* — Transfer modal —————————————————————————————————————————— */
    'Move funds between clinic accounts': 'تحويل الأموال بين حسابات العيادة',
    'From account': 'من حساب',
    'To account': 'إلى حساب',
    'Amount': 'المبلغ',
    'Note (optional)': 'ملاحظة (اختياري)',
    'What is this transfer for?': 'ما الغرض من هذا التحويل؟',
    'Free cash': 'النقد المتاح',
    'Drug purchase': 'شراء الأدوية',
    'Treatment fund': 'صندوق العلاج',
    'Stock fund': 'صندوق المخزون',

    'Oral Hygiene → Scaling → Braces Application → Bracket Fit':
      'نظافة الفم → تنظيف الجير → تركيب التقويم → ضبط الحاصرة',

    /* — Reservation rail ———————————————————————————————————————— */
    'Patient name': 'اسم المريض',
    'DATE & TIME': 'التاريخ والوقت',
    'Extend time': 'تمديد الوقت',
    'Send Reminder': 'إرسال تذكير',
    'CLINICAL WORKFLOW': 'المسار السريري',
    'Add Medical Record': 'إضافة سجل طبي',
    'Add Medical Checkup': 'إضافة فحص طبي',
    'Run the medical checkup to build a billable treatment plan.':
      'أجرِ الفحص الطبي لإنشاء خطة علاج قابلة للفوترة.',

    /* — Rail side panels ———————————————————————————————————————— */
    'Treatment summary': 'ملخص العلاج',
    'No treatment recorded yet': 'لم يُسجَّل أي علاج بعد',
    'Run the medical checkup first — approved teeth appear here as billable treatment.':
      'أجرِ الفحص الطبي أولاً — ستظهر الأسنان المعتمدة هنا كعلاج قابل للفوترة.',
    'Medical record': 'السجل الطبي',
    'Medical': 'علاجي',
    'Cosmetic': 'تجميلي',
    'Has treatment': 'له علاج',
    'No treatment': 'بدون علاج',
    'No findings on this chart yet.': 'لا توجد ملاحظات على هذا المخطط بعد.',
    'Next treatment': 'العلاج القادم',
    'Nothing scheduled': 'لا توجد مواعيد مجدولة',
    'Approve treatment in the medical checkup and follow-up visits will be planned here.':
      'اعتمد العلاج في الفحص الطبي وستُجدوَل زيارات المتابعة هنا.',
    'Attachments': 'المرفقات',
    'Upload file': 'رفع ملف',

    /* — Check-up wizard ————————————————————————————————————————— */
    'Medical Checkup': 'الفحص الطبي',
    'Medical data': 'البيانات الطبية',
    'Treatment Plan': 'خطة العلاج',
    'Oral Check': 'فحص الفم',
    'Oral check': 'فحص الفم',
    'Plan Agreement': 'الموافقة على الخطة',
    'Confirm the patient record and today’s vitals': 'تأكيد بيانات المريض والعلامات الحيوية اليوم',
    'Patient & medical data carry over from the previous check — update anything that has changed.':
      'تُنقل بيانات المريض والبيانات الطبية من الفحص السابق — حدّث ما تغيّر.',
    'BOOKED FOR': 'محجوز لـ',
    'Vitals & history': 'العلامات الحيوية والتاريخ المرضي',
    'Blood type': 'فصيلة الدم',
    'Blood pressure': 'ضغط الدم',
    'Conditions & allergies': 'الأمراض والحساسية',
    'Chief complaint': 'الشكوى الرئيسية',
    'What brought the patient in today?': 'ما سبب زيارة المريض اليوم؟',

    /* — Conditions ——————————————————————————————————————————— */
    'Diabetes': 'السكري',
    'High blood pressure': 'ارتفاع ضغط الدم',
    'Heart condition': 'أمراض القلب',
    'Penicillin allergy': 'حساسية البنسلين',
    'Latex allergy': 'حساسية اللاتكس',
    'Pregnancy': 'الحمل',
    'Asthma': 'الربو',

    /* — Tooth recording steps ——————————————————————————————————— */
    'Medical service': 'خدمة علاجية',
    'Cosmetic service': 'خدمة تجميلية',
    'Select a problem tooth to record findings': 'اختر السن المصاب لتسجيل الملاحظات',
    'Select a tooth for cosmetic work': 'اختر سناً للعمل التجميلي',
    'Select a tooth above to record a finding.': 'اختر سناً بالأعلى لتسجيل ملاحظة.',
    'RECORDED (0)': 'المُسجَّل (٠)',
    'The results of the examination of all teeth': 'نتائج فحص جميع الأسنان',
    'Confirm cosmetic work with the patient': 'تأكيد العمل التجميلي مع المريض',
    'No medical findings recorded': 'لا توجد ملاحظات علاجية مسجلة',
    'No cosmetic findings recorded': 'لا توجد ملاحظات تجميلية مسجلة',
    'Go back a step to add one, or continue.': 'ارجع خطوة لإضافة واحدة، أو تابع.',
    'Save checkup': 'حفظ الفحص',

    /* — Oral check ——————————————————————————————————————————— */
    'Habits': 'العادات',
    'Habits and soft-tissue findings': 'العادات وملاحظات الأنسجة الرخوة',
    'Soft tissue': 'الأنسجة الرخوة',
    'Latest dental visit': 'آخر زيارة لطبيب الأسنان',
    'Brushes per day': 'مرات التنظيف يومياً',
    'Uses floss': 'يستخدم الخيط',
    'Uses mouthwash': 'يستخدم غسول الفم',
    'Note': 'ملاحظة',
    '< 3 months': 'أقل من ٣ أشهر',
    '3–12 months': '٣ إلى ١٢ شهراً',
    '> 1 year': 'أكثر من سنة',
    'Once': 'مرة واحدة',
    'Twice': 'مرتان',
    '3 or more': '٣ أو أكثر',
    'Daily': 'يومياً',
    'Sometimes': 'أحياناً',
    'Never': 'أبداً',
    'Yes': 'نعم',
    'No': 'لا',
    'Healthy gums': 'لثة سليمة',
    'Gum bleeding': 'نزيف اللثة',
    'Canker sores': 'تقرحات الفم',
    'Coated tongue': 'لسان مطلي',
    'Dry mouth': 'جفاف الفم',
    'The lower and upper lips have canker sores': 'يوجد تقرحات في الشفة العليا والسفلى',

    'Edit date & time': 'تعديل التاريخ والوقت',
    'Save new time': 'حفظ الموعد الجديد',
    'Start time': 'وقت البدء',
    'Visits': 'الزيارات',
    'total': 'الإجمالي',
    'THIS VISIT': 'هذه الزيارة',
    'No other visits for this patient.': 'لا توجد زيارات أخرى لهذا المريض.',

    /* — Misc ————————————————————————————————————————————————— */
    'Good morning': 'صباح الخير',
    'dentists on shift': 'أطباء في الوردية',
    'appointments today': 'موعد اليوم',
    'No data': 'لا توجد بيانات',
    'JavaScript required': 'مطلوب تفعيل جافاسكربت'
  };

  /** Attributes whose values are shown to the user. */
  const ATTRS = ['placeholder', 'title', 'aria-label'];

  /* ----------------------------------------------------------------------
     Pattern rules
     ----------------------------------------------------------------------
     Some strings cannot be dictionary entries because they are generated:
     63 rolling dates, and labels composed from a name plus a live amount.
     These run only after an exact lookup misses.
     ---------------------------------------------------------------------- */

  const AR_WEEKDAY_SHORT = {
    Sun: 'الأحد', Mon: 'الاثنين', Tue: 'الثلاثاء', Wed: 'الأربعاء',
    Thu: 'الخميس', Fri: 'الجمعة', Sat: 'السبت'
  };

  const AR_MONTH_SHORT = {
    Jan: 'يناير', Feb: 'فبراير', Mar: 'مارس', Apr: 'أبريل',
    May: 'مايو', Jun: 'يونيو', Jul: 'يوليو', Aug: 'أغسطس',
    Sep: 'سبتمبر', Oct: 'أكتوبر', Nov: 'نوفمبر', Dec: 'ديسمبر'
  };

  /** `Sat, 1 Aug 2026` — the format core/format.js dayLabel() produces. */
  const DATE_RE = /^(Sun|Mon|Tue|Wed|Thu|Fri|Sat), (\d{1,2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4})$/;

  /** `12 Mar 2024` — the short form used in tables. */
  const SHORT_DATE_RE = /^(\d{1,2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4})$/;

  function translateDate(value) {
    const full = DATE_RE.exec(value);
    if (full) {
      return AR_WEEKDAY_SHORT[full[1]] + '، ' + full[2] + ' ' + AR_MONTH_SHORT[full[3]] + ' ' + full[4];
    }
    const short = SHORT_DATE_RE.exec(value);
    if (short) {
      return short[1] + ' ' + AR_MONTH_SHORT[short[2]] + ' ' + short[3];
    }
    return null;
  }

  /** Dictionary or date lookup for one fragment. No recursion into t(). */
  function lookupFragment(fragment) {
    const key = fragment.trim();
    return AR[key] || translateDate(key) || null;
  }

  /**
   * Strings assembled from fragments joined by a separator, which the UI
   * uses constantly: `Free cash — $4,012,409`, `09:00 AM – 10:00 AM · Bleaching`,
   * `2.4 MB · Today 09:02`.
   *
   * Each fragment is looked up on its own and untranslated ones are kept
   * verbatim, so a dentist's name or an amount passes through untouched. The
   * result is only used when at least one fragment actually changed —
   * otherwise ordinary prose containing a dash would be needlessly rebuilt.
   */
  function translateCompound(value) {
    for (const sep of [' — ', ' · ']) {
      if (!value.includes(sep)) continue;

      let changed = false;
      const parts = value.split(sep).map((part) => {
        const hit = lookupFragment(part);
        if (!hit) return part;
        changed = true;
        // Preserve any padding the original fragment carried.
        return part.replace(part.trim(), hit);
      });

      if (changed) return parts.join(sep);
    }
    return null;
  }

  /**
   * Booking-conflict sentences.
   *
   * These are assembled at runtime from a dentist name, an hour and a date,
   * so they can never be dictionary keys. Matching the shape and rebuilding
   * it keeps core/scheduling.js free of any language concern — it still
   * returns one plain English sentence, and this is the only place that
   * knows how to say it in Arabic.
   *
   * Captured fragments are re-run through `t()` so the embedded date is
   * localised as well.
   */
  const AR_MONTH_LONG = {
    January: 'يناير', February: 'فبراير', March: 'مارس', April: 'أبريل',
    May: 'مايو', June: 'يونيو', July: 'يوليو', August: 'أغسطس',
    September: 'سبتمبر', October: 'أكتوبر', November: 'نوفمبر', December: 'ديسمبر'
  };

  const AR_WEEKDAY_LONG = {
    Sunday: 'الأحد', Monday: 'الاثنين', Tuesday: 'الثلاثاء', Wednesday: 'الأربعاء',
    Thursday: 'الخميس', Friday: 'الجمعة', Saturday: 'السبت'
  };

  const SENTENCES = [
    /* Dashboard greeting and roster line — both built from live values. */
    [/^Good morning, (.+)$/, (name) => `صباح الخير، ${name}`],
    [/^Good afternoon, (.+)$/, (name) => `مساء الخير، ${name}`],
    [/^Good evening, (.+)$/, (name) => `مساء الخير، ${name}`],

    [/^(\w+), (\d{1,2}) (\w+) (\d{4}) · (\d+) dentists on shift · (\d+) appointments today$/,
     (wd, day, month, year, docs, appts) =>
       `${AR_WEEKDAY_LONG[wd] || wd}، ${day} ${AR_MONTH_LONG[month] || month} ${year}` +
       ` · ${docs} أطباء في الوردية · ${appts} موعد اليوم`],

    /* Relative timestamps inside composed metadata, e.g. `2.4 MB · Today 09:02`. */
    [/^(.+) · Today (\d{1,2}:\d{2})$/, (head, time) => `${head} · اليوم ${time}`],
    [/^(.+) · Yesterday (\d{1,2}:\d{2})$/, (head, time) => `${head} · أمس ${time}`],
    [/^Today (\d{1,2}:\d{2})$/, (time) => `اليوم ${time}`],
    [/^Yesterday (\d{1,2}:\d{2})$/, (time) => `أمس ${time}`],

    [/^(\d+) total$/, (n) => `${n} إجمالاً`],

    /* Long date on its own. */
    [/^(\w+), (\d{1,2}) (\w+) (\d{4})$/, (wd, day, month, year) =>
      AR_WEEKDAY_LONG[wd]
        ? `${AR_WEEKDAY_LONG[wd]}، ${day} ${AR_MONTH_LONG[month] || month} ${year}`
        : null],

    [/^(.+) does not work on (.+)\. Pick another date or dentist\.$/,
     (d, day) => `${d} لا يعمل يوم ${t(day)}. اختر تاريخاً أو طبيباً آخر.`],

    [/^(.+) already has an appointment at (.+) on (.+)\.$/,
     (d, hour, day) => `${d} لديه موعد بالفعل الساعة ${hour} يوم ${t(day)}.`],

    [/^(.+) works (.+) – (.+)\. This slot falls outside that shift\.$/,
     (d, from, to) => `${d} يعمل من ${from} إلى ${to}. هذا الموعد خارج الوردية.`],

    [/^(.+) works (.+) – (.+)\. This slot runs past the shift\.$/,
     (d, from, to) => `${d} يعمل من ${from} إلى ${to}. هذا الموعد يتجاوز الوردية.`],

    [/^(.+) is on break at (.+)\. Pick a slot that does not overlap it\.$/,
     (d, hour) => `${d} في استراحة الساعة ${hour}. اختر موعداً لا يتداخل معها.`],

    [/^(.+) already has an appointment then\.$/,
     (d) => `${d} لديه موعد بالفعل في هذا الوقت.`]
  ];

  function translateSentence(value) {
    for (const [pattern, build] of SENTENCES) {
      const m = pattern.exec(value);
      if (!m) continue;
      // A rule may match structurally but decline (unknown month name),
      // in which case fall through to the remaining rules.
      const built = build(...m.slice(1));
      if (built) return built;
    }
    return null;
  }

  /**
   * Translate a single phrase.
   * Trailing/leading whitespace is preserved so inline layout is untouched.
   */
  function t(text) {
    const trimmed = text.trim();
    if (!trimmed) return text;

    const hit = AR[trimmed]
      || translateDate(trimmed)
      || translateCompound(trimmed)
      || translateSentence(trimmed);
    if (!hit) return text;

    const lead = text.slice(0, text.indexOf(trimmed[0]));
    const tail = text.slice(lead.length + trimmed.length);
    return lead + hit + tail;
  }

  /**
   * Translate everything under `root` in place.
   *
   * Called after each render when the language is Arabic. Skips <script>,
   * <style> and the icon font — Material Symbols renders its ligature names
   * as glyphs, so translating them would break every icon.
   */
  function translateTree(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tag = parent.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'I') {
          return NodeFilter.FILTER_REJECT;
        }
        return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });

    const nodes = [];
    let node;
    while ((node = walker.nextNode())) nodes.push(node);
    for (const n of nodes) {
      const next = t(n.nodeValue);
      if (next !== n.nodeValue) n.nodeValue = next;
    }

    for (const el of root.querySelectorAll('[placeholder],[title],[aria-label]')) {
      for (const attr of ATTRS) {
        const value = el.getAttribute(attr);
        if (!value) continue;
        const next = t(value);
        if (next !== value) el.setAttribute(attr, next);
      }
    }
  }

  Ivora.define('core/i18n', {
    t: t,
    translateTree: translateTree,
    dictionary: AR
  });
})();
