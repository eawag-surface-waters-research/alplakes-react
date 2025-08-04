//
//  GNBridge.h
//  GoNativeCore
//
//  Created by Hunaid Hassan on 21.06.21.
//

#import <Foundation/Foundation.h>
#import <WebKit/WebKit.h>
#import "GNJavascriptRunner.h"
#import "GNController.h"

NS_ASSUME_NONNULL_BEGIN

@interface GNBridge : NSObject

@property (nonatomic, copy, readonly) NSDictionary *launchOptions;

- (BOOL)runner:(id<GNJavascriptRunner>)runner shouldLoadRequestWithURL:(NSURL*)url withData:(NSDictionary*)query;
- (void)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions;
- (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options;
- (void)applicationWillResignActive:(UIApplication *)application;
- (void)applicationDidEnterBackground:(UIApplication *)application;
- (void)applicationWillEnterForeground:(UIApplication *)application;
- (void)applicationWillTerminate:(UIApplication *)application;
- (void)applicationDidBecomeActive:(UIApplication *)application;
- (void)loadUserScriptsForContentController:(WKUserContentController *)userController;
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken;
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo;
- (BOOL)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity;
- (id<GNController>)getControllerForKey:(NSString *)key runner:(id<GNJavascriptRunner>)runner;
- (void)runnerDidLoad:(id<GNJavascriptRunner>)runner;
- (void)runnerWillAppear:(id<GNJavascriptRunner>)runner;
- (void)runnerWillDisappear:(id<GNJavascriptRunner>)runner;
- (void)hideWebViewWithRunner:(id<GNJavascriptRunner>)runner;
- (void)switchToWebView:(UIView*)newView withRunner:(id<GNJavascriptRunner>)runner;
- (void)runner:(id<GNJavascriptRunner>)runner willTransitionToSize:(CGSize)size withTransitionCoordinator:(id<UIViewControllerTransitionCoordinator>)coordinator;
- (void)webView:(WKWebView *)webView didFinishNavigation:(WKNavigation *)navigation withRunner:(id<GNJavascriptRunner>)runner;
- (void)webView:(WKWebView *)webView handleURL:(NSURL *)url;
- (BOOL)webView:(WKWebView *)webView shouldDownloadUrl:(NSURL *)url;
- (NSArray<NSURLQueryItem *> *)getInitialUrlQueryItems;
@end

NS_ASSUME_NONNULL_END
