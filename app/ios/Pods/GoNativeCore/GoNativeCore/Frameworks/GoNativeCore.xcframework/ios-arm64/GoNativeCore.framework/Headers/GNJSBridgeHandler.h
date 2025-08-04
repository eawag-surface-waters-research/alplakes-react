//
//  GNJSBridgeHandler.h
//  GoNativeCore
//
//  Created by bld on 11.11.22.
//

#import <Foundation/Foundation.h>
#import <WebKit/WebKit.h>

NS_ASSUME_NONNULL_BEGIN

@interface WebViewControllerProp : NSObject
- (void)downloadImage:(NSURL*)url completion:(void (^)(NSDictionary *result))completion;
- (void)downloadBlobUrl:(NSURL *)url filename:(NSString *)filename callback:(NSString *)callback;
- (void)handleUrl:(NSURL *)url query:(NSDictionary*)query;
- (void)openPDF:(NSURL * _Nullable)url wvc:(UIViewController *)wvc;
- (void)openUrl:(NSURL *)url mode:(NSString *)mode;
- (void)shareUrl:(NSURL*)url fromView:(UIView*)view filename:(NSString*)filename open:(BOOL)open completion:(void (^)( NSString *error))completion;
- (void)showKeyboardAccessoryView:(BOOL)visible;
- (void)subscribeEvent:(NSString *)eventName;
- (void)unsubscribeEvent:(NSString *)eventName;
@end

@interface WebViewController : UIViewController
- (NSDictionary *)getConnectivity;
- (void)handleJSBridgeFunctions:(id)data;
- (UIViewController *)getTopPresentedViewController;
- (void)refreshPage;
- (void)requestLocation;
- (void)runCustomCode:(NSDictionary *)query;
- (void)runGonativeDeviceInfoWithCallback:(NSString*)callback;
- (void)runJavascriptWithCallback:(id)callback data:(NSDictionary*)data;
- (void)runKeyboardInfoWithCallback:(NSString*)callback;
- (void)setCssTheme:(NSString *)mode andPersistData:(BOOL)persist;
- (void)setNativeTheme:(NSString *)mode;
- (void)sharePageWithUrl:(NSString*)url text:(NSString*)text sender:(id _Nullable)sender;
- (void)updateNavigationBarItemsAnimated:(BOOL)animated;
- (void)startWatchingLocation;
- (void)stopWatchingLocation;
- (void)themeManagerHandleUrl:(NSURL *)url query:(NSDictionary *)query;
- (void)updateWindowsController;

@property WebViewControllerProp *backgroundAudio;
@property WebViewControllerProp *configPreferences;
@property WebViewControllerProp *documentSharer;
@property WebViewControllerProp *eventsManager;
@property WebViewControllerProp *fileWriterSharer;
@property WebViewControllerProp *keyboardManager;
@property WebViewControllerProp *logManager;
@property WebViewControllerProp *regexRulesManager;
@property WebViewControllerProp *registrationManager;
@property WebViewControllerProp *tabManager;
@property WebViewControllerProp *toolbarManager;
@property WebViewControllerProp *pdfManager;
@property WebViewControllerProp *windowsManager;

@property (nullable) NSString *connectivityCallback;
@property NSURLRequest *currentRequest;
@property (nullable) UIView *defaultTitleView;
@property BOOL javascriptTabs;
@property BOOL restoreBrightnessOnNavigation;
@property CGFloat savedScreenBrightness;
@property BOOL sidebarItemsEnabled;
@property WKWebView *wkWebview;
@end

@interface GNJSBridgeHandler : NSObject
+(GNJSBridgeHandler *)shared;

- (void)handleUrl:(NSURL *)url query:(NSDictionary *)query wvc:(WebViewController *)wvc;
@end

NS_ASSUME_NONNULL_END
