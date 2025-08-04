//
//  LEANActionManager.h
//  GoNativeIOS
//
//  Created by Weiyin He on 11/25/14.
//  Copyright (c) 2014 GoNative.io LLC. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "LEANWebViewController.h"

@interface LEANActionButtons : NSObject
@property NSArray *rightItems;
@property NSArray *leftItems;
@end

@interface LEANActionManager : NSObject
@property(readonly, assign) NSString *currentSearchTemplateUrl;

- (instancetype)initWithWebviewController:(LEANWebViewController*)wvc;
- (void)didLoadUrl:(NSURL*)url;
- (void)traitCollectionDidChange:(UITraitCollection *)previousTraitCollection;
- (UIBarButtonItem *)createNavBarButtonWithLabel:(NSString *)label icon:(NSString *)icon target:(id)target action:(SEL)action;
- (LEANActionButtons *)configureNavBarButtonsAllowingLeftAction:(BOOL)allowLeftAction;
@end
