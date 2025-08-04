//
//  LEANActionManager.m
//  GoNativeIOS
//
//  Created by Weiyin He on 11/25/14.
//  Copyright (c) 2014 GoNative.io LLC. All rights reserved.
//

#import "LEANActionManager.h"
#import "GonativeIO-Swift.h"

@implementation LEANActionButtons

- (instancetype)initWithLeftItems:(NSArray *)leftItems rightItems:(NSArray *)rightItems {
    self = [super init];
    if (self) {
        self.leftItems = leftItems;
        self.rightItems = rightItems;
    }
    return self;
}

@end

@interface LEANActionManager ()
@property NSMutableArray<UIBarButtonItem *> *items;
@property (weak, nonatomic) LEANWebViewController *wvc;
@property NSString *currentMenuID;
@property NSMutableArray *buttons;
@property NSMutableArray *actionsData;
@property (readwrite, assign) NSString *currentSearchTemplateUrl;
@property CustomMenu *menuView;
@end

@implementation LEANActionManager

- (instancetype)initWithWebviewController:(LEANWebViewController *)wvc
{
    self = [super init];
    if (self) {
        self.wvc = wvc;
    }
    return self;
}

- (void)didLoadUrl:(NSURL *)url {
    if (!url) {
        return;
    }
    
    GoNativeAppConfig *appConfig = [GoNativeAppConfig sharedAppConfig];
    NSString *urlString = [url absoluteString];
    
    for (NSUInteger i = 0; i < appConfig.actionSelection.count; i++) {
        ActionSelection *actionSelection = appConfig.actionSelection[i];
        @try {
            if ([actionSelection.regex evaluateWithObject:urlString]) {
                [self setMenuID:actionSelection.identifier];
                return;
            }
        }
        @catch (NSException* exception) {
            NSLog(@"Error in action regex: %@", exception);
        }
    }
    
    [self setMenuID:nil];
}

- (void)setMenuID:(NSString *)menuID
{
    if (![self.currentMenuID isEqualToString:menuID] && (self.currentMenuID != nil || menuID != nil)) {
        self.currentMenuID = menuID;
    }
    
    [self.wvc updateNavigationBarItemsAnimated:YES];
}

- (LEANActionButtons *)configureNavBarButtonsAllowingLeftAction:(BOOL)allowLeftAction {
    if (!self.currentMenuID) {
        self.items = nil;
        self.currentSearchTemplateUrl = nil;
        return [[LEANActionButtons alloc] initWithLeftItems:@[] rightItems:@[]];
    }
    
    self.items = [NSMutableArray array];
    self.buttons = [NSMutableArray array];
    self.actionsData = [NSMutableArray array];
    
    NSDictionary *actionGroup = [GoNativeAppConfig sharedAppConfig].actions[self.currentMenuID];
    if (![actionGroup isKindOfClass:[NSDictionary class]] || ![actionGroup[@"items"] isKindOfClass:[NSArray class]]) {
        return [[LEANActionButtons alloc] initWithLeftItems:@[] rightItems:@[]];
    }
    
    NSArray *actions = actionGroup[@"items"];
    BOOL allowLeftMenu = [actionGroup[@"allowLeftMenu"] boolValue];
    
    NSUInteger maxVisibleItems = 1;
    if (UIDevice.currentDevice.userInterfaceIdiom == UIUserInterfaceIdiomPad) {
        maxVisibleItems = 4;
    }
    if (allowLeftAction && allowLeftMenu) {
        maxVisibleItems += 1;
    }
    
    NSArray *menu = actions;
    if (actions.count > maxVisibleItems + 1) {
        NSMutableArray *visibleItems = [NSMutableArray arrayWithArray:[actions subarrayWithRange:NSMakeRange(0, maxVisibleItems)]];
        [visibleItems addObject: @{
            @"label": @"Menu",
            @"icon": @"md mi-more-vert",
            @"submenu": [actions subarrayWithRange:NSMakeRange(maxVisibleItems, actions.count - maxVisibleItems)]
        }];
        menu = visibleItems;
    }
    
    for (NSDictionary *entry in menu) {
        NSString *system = entry[@"system"];
        NSString *label = entry[@"label"];
        NSString *icon = entry[@"icon"];
        NSString *url = entry[@"url"];
        NSArray *submenu = entry[@"submenu"];
        
        [self.actionsData insertObject:@{ @"system": system ?: @"", @"url": url ?: @"" } atIndex:0];
        
        if ([system isKindOfClass:[NSString class]]) {
            if ([system isEqualToString:@"share"]) {
                [self createButtonWithIcon:icon defaultIcon:@"md mi-ios-share" label:label url:url menu:submenu];
                continue;
            }
            if ([system isEqualToString:@"refresh"]) {
                [self createButtonWithIcon:icon defaultIcon:@"fas fa-redo-alt" label:label url:url menu:submenu];
                continue;
            }
            if ([system isEqualToString:@"search"]) {
                [self createButtonWithIcon:icon defaultIcon:@"fas fa-search" label:label url:url menu:submenu];
                continue;
            }
        }
        
        [self createButtonWithIcon:icon defaultIcon:@"" label:label url:url menu:submenu];
    }
    
    NSArray *leftItems = @[];
    NSArray *rightItems = self.items;
    
    if (allowLeftAction && allowLeftMenu) {
        leftItems = self.items.count > 0 ? @[self.items.lastObject] : @[];
        rightItems = self.items.count > 1 ? [self.items subarrayWithRange:NSMakeRange(0, self.items.count - 1)] : @[];
    }
    
    return [[LEANActionButtons alloc] initWithLeftItems:leftItems rightItems:rightItems];
}

- (UIButton *)buttonWithIcon:(NSString *)icon {
    UIImage *iconImage = [LEANIcons imageForIconIdentifier:icon size:[self sizeForIcon:icon] color:[UIColor blackColor]];
    UIButton *button = [UIButton buttonWithType:UIButtonTypeSystem];
    [button setImage:iconImage forState:UIControlStateNormal];
    [button setFrame:CGRectMake(0, 0, 30, 30)];
    button.tintColor = [UIColor colorNamed:@"titleColor"];
    return button;
}

- (void)createButtonWithIcon:(NSString *)icon defaultIcon:(NSString *)defaultIcon label:(NSString *)label url:(NSString *)url menu:(NSArray *)menu {
    if (defaultIcon && (![icon isKindOfClass:[NSString class]] || icon.length == 0)) {
        icon = defaultIcon;
    }
    
    UIButton *button = [self buttonWithIcon:icon];
    
    if ([menu isKindOfClass:[NSArray class]]) {
        objc_setAssociatedObject(button, "menu", menu, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
        [button addTarget:self action:@selector(openMenu:) forControlEvents:UIControlEventTouchUpInside];
    }
    else {
        [button addTarget:self action:@selector(itemWasSelected:) forControlEvents:UIControlEventTouchUpInside];
    }
    
    UIBarButtonItem *buttonItem = [[UIBarButtonItem alloc] initWithCustomView:button];
    [buttonItem setAccessibilityLabel:label];
    
    [self.items insertObject:buttonItem atIndex:0];
    [self.buttons insertObject:button atIndex:0];
}

- (UIBarButtonItem *)createNavBarButtonWithLabel:(NSString *)label icon:(NSString *)icon target:(id)target action:(SEL)action {
    UIButton *button = [self buttonWithIcon:icon];
    [button addTarget:target action:action forControlEvents:UIControlEventTouchUpInside];
    
    UIBarButtonItem *barButtonItem = [[UIBarButtonItem alloc] initWithCustomView:button];
    barButtonItem.accessibilityLabel = label;
    return barButtonItem;
}

- (CGFloat)sizeForIcon:(NSString *)iconName {
    CGFloat size = 22;
    if ([iconName hasPrefix:@"custom "]) {
        size = size * 1.05;
    } else if ([iconName hasPrefix:@"md "]) {
        size = size * 1.2;
    }
    return size;
}

- (void)itemWasSelected:(id)sender {
    NSUInteger index = [self.buttons indexOfObject:sender];
    
    if (index == NSNotFound || index >= self.actionsData.count) {
        return;
    }
    
    NSDictionary *data = self.actionsData[index];
    NSString *system = data[@"system"];
    NSString *url = data[@"url"];
    
    [self handleAction:system url:url];
}

- (void)handleAction:(NSString *)system url:(NSString *)url {
    if ([system isKindOfClass:[NSString class]]) {
        if ([system isEqualToString:@"share"]) {
            [self.wvc sharePage:nil];
            return;
        }
        if ([system isEqualToString:@"refresh"]) {
            [self.wvc refreshPressed:nil];
            return;
        }
        if ([system isEqualToString:@"search"]) {
            if ([url isKindOfClass:[NSString class]]) {
                self.currentSearchTemplateUrl = url;
            } else {
                self.currentSearchTemplateUrl = @"";
            }
            [self.wvc searchPressed:nil];
            return;
        }
    }
    
    [self.wvc handleJsNavigationUrl:url];
}

- (void)openMenu:(id)sender {
    [self closeMenu];
    
    UIButton *button = (UIButton *)sender;
    NSArray *menu = objc_getAssociatedObject(sender, "menu");
    
    UIView *keyWindow = UIApplication.sharedApplication.currentKeyWindow;
    
    self.menuView = [[CustomMenu alloc] initWithContainer:keyWindow button:button data:menu onTap:^(NSDictionary *data) {
        [self closeMenu];
        
        NSString *system = data[@"system"];
        NSString *url = data[@"url"];
    
        [self handleAction:system url:url];
    }];
    
    [self.menuView setMenuColor:[UIColor colorNamed:@"navigationBarTintColor"]];
}

- (void)closeMenu {
    if (self.menuView) {
        [self.menuView removeFromSuperview];
        self.menuView = nil;
    }
}

- (void)traitCollectionDidChange:(UITraitCollection *)previousTraitCollection {
    // Close menu so the icons update their color
    [self closeMenu];
}

@end
